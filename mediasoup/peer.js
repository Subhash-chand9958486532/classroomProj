const Consumer = require("./consumer");

class Peer {
    constructor(socket, userData, router, io, room) {
        this.socket = socket;
        this.userData = userData;
        this.router = router;
        this.webRtcSendTransport = undefined;
        this.sendWebRtcData = undefined;
        this.webRTCrecvTransport = undefined;
        this.recvWebRtcData = undefined;
        this.videoProducer = undefined;
        this.audioProducer = undefined;
        this.consumers = [];
        this.io = io;
        this.room = room;
        this.listenIps = [{ ip: "192.168.2.147"}];
        this.setUpListners();
        
    }
    setUpListners() {
        this.socket.on("create-send-transport", ()=>{
            this.setUpSendTransport()
            .then(()=>{
                console.log("=======================+>send transport created");
                this.socket.emit("send-transport-created", this.sendWebRtcData);
            })
            
        });
        this.socket.on("create-recv-transport", (socketId)=>{
            this.setUpRecvTrasport()
            .then(()=>{
                console.log("=======================+>recevie transport created");
                console.log(this.socket.id);
                this.socket.emit("recv-transport-created", this.recvWebRtcData);
            });  
        });
        this.socket.on("connect-send-transport", this.connectSendTransport);
        this.socket.on("connect-recv-transport", this.connectRecvTransport);

        this.socket.on("connect-with-user", this.connectWithUser);
        this.socket.on("reverse-connect-with-user", this.reverseConnectWithUser);
        this.socket.on("create-producer", this.setUpProducer);
        this.socket.on("play-pause-video", (data)=>{
            let consumer = this.getAvailableConsumer(data.id);
            if(consumer!=undefined) {
                consumer.playPauseVideo(data.type)

            } else {
                console.log('can not play or pause video consumer because consumer is undefined with id: '+data.id);
            }
        });
        this.socket.on("play-pause-audio", (data)=>{
            let consumer = this.getAvailableConsumer(data.id);
            if(consume!=undefined) {
                consumer.playPauseAudio(data.type)
            } else {
                console.log('can not play or pause audio consumer because consumer is undefined with id: '+data.id);
            }
        });

        this.socket.on("test", (data)=>{
            console.log("clientTesting "+ data);
            this.socket.emit("test", data);
        })
    }
    resetSocket(socket) {
        this.socket = socket;
        this.setUpListners();
    }
    reverseConnectWithUser =({userData, rtpCapabilities})=>{
        let peer = this.room.getPeer(userData.id);
        let videoData = {producerId:peer.videoProducer.id, rtpCapabilities:rtpCapabilities};
        let audioData = {producerId:peer.audioProducer.id, rtpCapabilities:rtpCapabilities};
        let consumer = this.getConsumer(userData);
        this.setUpConsumer(videoData, consumer);
        this.setUpConsumer(audioData, consumer);

    }
    connectWithUser =({userData, rtpCapabilities})=>{
        let peer = this.room.getPeer(userData.id);
        let videoData = {producerId:peer.videoProducer.id, rtpCapabilities:rtpCapabilities};
        let audioData = {producerId:peer.audioProducer.id, rtpCapabilities:rtpCapabilities};
        peer.socket.emit("join-back", this.userData);
        let consumer = this.getConsumer(userData);
        this.setUpConsumer(videoData, consumer);
        this.setUpConsumer(audioData, consumer);

    }
    getAvailableConsumer(id) {
        for(let c of this.consumers) {
            if(c.id===id) {
                return c;
            }
        } 
        console.log('consumer does not exist!');
        return undefined;
    }
    getConsumer(userData) {
        for(let c of this.consumers) {
            if(c.id===userData.id) {
                return c;
            }
        }
        let consumer =  new Consumer(userData);
        this.addConsumer(consumer);
        return consumer;
    }
    addConsumer(consumer) {
        this.consumers.push(consumer);
    }
    removeConsumer(consumer) {
        let index = this.consumers.indexOf(consumer);
        if(index!=-1){
            this.consumers.splice(index, 1);
        } else {
            console.log("consumer dose not exist!");
        }
    }
    connectSendTransport = async({dtlsParameters})=>{
        try {
            await this.webRtcSendTransport.connect({dtlsParameters:dtlsParameters});
            this.socket.emit("send-transport-connected", null);
        } catch (err) {
            console.log(`error in connecting transport->: ${err}`);
        }
    };
    connectRecvTransport = async({dtlsParameters})=>{
        try {
            await this.webRTCrecvTransport.connect({dtlsParameters:dtlsParameters});
            this.socket.emit("recv-transport-connected", null);
        } catch (err) {
            console.log(`error in connecting recieve transport->: ${err}`);
        }
    }
    async setUpSendTransport() {
        try {
            this.webRtcSendTransport = await this.router.createWebRtcTransport({
                listenIps : this.listenIps,
                enableUdp : true,
                enableTcp : true,
                enableSctp:true
            });
            this.sendWebRtcData ={
                id:this.webRtcSendTransport.id,
                iceParameters:this.webRtcSendTransport.iceParameters,
                iceCandidates:this.webRtcSendTransport.iceCandidates,
                dtlsParameters:this.webRtcSendTransport.dtlsParameters,
                sctpParameters:this.webRtcSendTransport.sctpParameters
            }
        } catch (error) {
            console.log(`error on creating webrtc send transport of "name" ${this.name}-> ${error}`);
        }
    }
    async setUpRecvTrasport() {
        try {
            this.webRTCrecvTransport = await this.router.createWebRtcTransport({
                listenIps : this.listenIps,
                enableUdp : true,
                enableTcp : true,
                enableSctp:true
            });
            this.recvWebRtcData ={
                id:this.webRTCrecvTransport.id,
                iceParameters:this.webRTCrecvTransport.iceParameters,
                iceCandidates:this.webRTCrecvTransport.iceCandidates,
                dtlsParameters:this.webRTCrecvTransport.dtlsParameters,
                sctpParameters:this.webRTCrecvTransport.sctpParameters
            }
        } catch (error) {
            console.log(`error on creating webrtc recv transport of "name" ${this.name}-> ${error}`);
        }
    }
    setUpProducer = async({kind, rtpParameters})=>{
        console.log(kind);
        try {
            if(kind==="video") {
                this.videoProducer = await this.webRtcSendTransport.produce({
                    kind:kind,
                    rtpParameters:rtpParameters
                });
                this.socket.emit("producer-done", this.videoProducer.id);
            } else if(kind==="audio") {
                this.audioProducer = await this.webRtcSendTransport.produce({
                    kind:kind,
                    rtpParameters:rtpParameters
                });
                this.socket.emit("producer-done", this.audioProducer.id);
            }
            if(this.videoProducer!=undefined && this.audioProducer!=undefined) 
            this.socket.to(this.room.id).emit("user-join", this.userData);
           
        } catch (error) {
            console.log(`error in produce method of "name" ${this.name}-> ${error}`);
        }
    }

    setUpConsumer = async({producerId, rtpCapabilities}, consumer)=>{
        if(!this.router.canConsume({producerId, rtpCapabilities})) {
            console.log(`media can not be consumed with producer id: ${producerId} and rtpCaabilities: ${rtpCapabilities}`);
            return;
        }

        try {
            const consumerType = await this.webRTCrecvTransport.consume({
                producerId,
                rtpCapabilities,
                paused:true
            });
            let consumerData = {
                id: consumerType.id,
                producerId:consumerType.producerId,
                kind:consumerType.kind,
                rtpParameters:consumerType.rtpParameters,
            }
            
            if(consumerType.kind==="audio") {
                consumer.audioConsumer = consumerType;
            } else if(consumerType.kind==="video") {
                consumer.videoConsumer = consumerType;
            }
            let data = {
                consumerData: consumerData,
                userData: consumer.userData
            }
            this.socket.emit("consumer-done", data);
        } catch (error) {
            console.log(`error in creating consumer: ${error}`);
        }
        
    }
}

module.exports = Peer;