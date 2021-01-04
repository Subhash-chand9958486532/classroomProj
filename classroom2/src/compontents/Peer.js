import Consumer from './Consumer';
class Peer {
    constructor(socket, userData, device) {
        this.socket = socket;
        this.userData = userData;
        this.device = device;
        this.stream = undefined;
        this.sendTransport = undefined;
        this.recvTransport = undefined;
        this.videoProducer = undefined;
        this.audioProducer = undefined;
        this.consumers = [];
        this.produceData = undefined;
        this.streamEvent = undefined;
        this.isDispachReady = true;
        this.teacherConsumer = undefined;
        this.setUpListners();
        
    }
    setUpListners() {
        this.socket.once("send-transport-created", (data)=>{
            console.log("==============================++>send trasport created at the server");
            // console.log(data);
            this.setUpSendTransport(data);
        });
        this.socket.once("recv-transport-created", (data)=>{
            console.log("=============++> recivee transport created at the server");
            console.log(this.socket.id);
            console.log(data);
            this.setUpRecvTransport(data);
        });

        this.socket.on("consumer-done", ({consumerData, userData})=>{
            console.log(userData);
            
            if(userData.type==="teacher") {
                let consumer = this.getTeacherConsumer(userData);
                this.setUpConsumer(consumerData, consumer)
                .then(()=>{
                    console.log("track of teacher has been obtained");
                    if(consumer.videoConsumer!=undefined && consumer.audioConsumer!=undefined) {
                        consumer.playPauseVideo("play");
                        let stream = new MediaStream([consumer.audioConsumer.track, consumer.videoConsumer.track]);
                        let event = new CustomEvent("gotTeacher");
                        event.data = {isTeacher:false, teacherStream:stream, teacherData:userData};
                        window.document.dispatchEvent(event);
                    }
                })

            } else {
                let consumer = this.getConsumer(userData);
                this.setUpConsumer(consumerData, consumer)
                .then(()=>{
                    console.log("track has been obtained");
                    if(consumer.videoConsumer!=undefined && consumer.audioConsumer!=undefined) {
                        this.streamEvent.data =  {consumers:this.consumers};
                        window.document.dispatchEvent(this.streamEvent);
                    }
                });
            }
        });
        this.socket.on("join-back", (userData)=>{
            this.socket.emit("reverse-connect-with-user", {userData:userData, rtpCapabilities:this.device.rtpCapabilities})    
        })
        this.streamEvent = new CustomEvent("gotStream");
    }

    createTransports(stream) {
        this.stream = stream;
        this.socket.emit("create-send-transport", null);
        this.socket.emit("create-recv-transport", this.socket.id);
        // this.createRecvTransport();
    }
    connectWithUser(userData) {
        this.socket.emit("connect-with-user", {userData:userData, rtpCapabilities:this.device.rtpCapabilities})
    }
    
    getConsumer(userData) {
        for(let c of this.consumers) {
            if(c.id===userData.id) {
                return c;
            }
        }
        let consumer =  new Consumer(userData, this);
        this.addConsumer(consumer);
        return consumer;
    }
    getTeacherConsumer(userData) {
        if(this.teacherConsumer==undefined) {
            this.teacherConsumer = new Consumer(userData, this);
        } 
        return this.teacherConsumer;
    }
    addConsumer(consumer) {
        this.consumers.push(consumer);
    }
    removeConsumer(consumer) {
        let index = this.consumers.indexOf(consumer);
        if(index!=-1) {
            this.consumers.splice(index, 1);

        } else {
            console.log("consumer dose not exist!");
        }
    }
    PlayPauseVideo(type) {
        this.socket.emit("play-pause", type);
    }
    async setUpSendTransport({id, iceParameters, iceCandidates, dtlsParameters, sctpParameters}) {
        this.sendTransport = this.device.createSendTransport({
            id,
            iceParameters,
            iceCandidates,
            dtlsParameters,
            sctpParameters,
        });

        this.sendTransport.on("connect", async({dtlsParameters}, callBack, errBack)=>{
            console.log("connect event occurs");
            try {
                this.socket.emit("connect-send-transport", {
                    transportId    : id, 
                    dtlsParameters : dtlsParameters 
                });
                this.socket.on("send-transport-connected", ()=>{
                    callBack();
                })

            }catch(err) {
                errBack(err);
            }

        });
        this.sendTransport.on("produce", async({kind, rtpParameters}, callBack, errBack)=>{
            console.log(`produce event occurs with kind: ${kind}`);
            let produceData = {
                kind:kind,
                rtpParameters, rtpParameters
            };
            this.socket.emit("create-producer", produceData);
            this.socket.once("producer-done", (id)=>{
                console.log("produer_done");
                callBack({id})
            })

        });
        this.setUpProducer();
    }
    async setUpRecvTransport({id, iceParameters, iceCandidates, dtlsParameters, sctpParameters}) {
        this.recvTransport = this.device.createRecvTransport({
            id,
            iceParameters,
            iceCandidates,
            dtlsParameters,
            sctpParameters,
        });

        this.recvTransport.on("connect", async({dtlsParameters}, callBack, errBack)=>{
            console.log("connect event occurs in receive transport");
            try {
                this.socket.emit("connect-recv-transport", {
                    transportId    : id, 
                    dtlsParameters : dtlsParameters 
                });
                this.socket.once("recv-transport-connected", ()=>{
                    callBack();
                })

            }catch(err) {
                errBack(err);
            }

        });

        
    }   
    async setUpProducer() {
        try {
            this.videoProducer = await this.sendTransport.produce({
                track: this.stream.getVideoTracks()[0]
            });
            this.audioProducer = await this.sendTransport.produce({
                track: this.stream.getAudioTracks()[0]
            })
        } catch (error) {
            console.log(`error in producing: ${error}`);
        }
    }

    async setUpConsumer({id, producerId, kind, rtpParameters}, consumer) {
        try {
            const consumerType = await this.recvTransport.consume({
                id,
                producerId,
                kind,
                rtpParameters,
            });
            if(kind==="audio") {
                consumer.audioConsumer = consumerType;
            } else if(kind==="video") {
                consumer.videoConsumer = consumerType;
            }
            
        } catch (error) {
            console.log(`error in consuming: ${error}`);
        }
    }

}
export default Peer;