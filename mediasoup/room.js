const {  createWorker} = require("mediasoup");


class Room {
    


    constructor(id) {
        this.peers = [];
        this.id = id;
        this.worker = undefined;
        this.router = undefined;
        this.mediaCodecs = [
            {
              "kind": "audio",
              "mimeType": "audio/opus",
              "clockRate": 48000,
              "channels": 2
            },
            {
              "kind": "video",
              "mimeType": "video/VP8",
              "clockRate": 90000,
              "parameters": {
          
              }
            },
            {
              "kind": "video",
              "mimeType": "video/H264",
              "clockRate": 90000,
              "parameters": {
                  "packetization-mode": 1,
                  "profile-level-id": "4d0032",
                  "level-asymmetry-allowed": 1
              }
            },
            {
              "kind": "video",
              "mimeType": "video/H264",
              "clockRate": 90000,
              "parameters": {
                  "packetization-mode": 1,
                  "profile-level-id": "42e01f",
                  "level-asymmetry-allowed": 1
              }
            }
        ]

    }
    addPeer(peer) {
        this.peers.push(peer);
    }
    removePeer(peer) {
        let index = this.peers.indexOf(peer);
        if(index!==-1) {
            this.peers.splice(index, 1);
        }
    }
    getPeer(id){
        for(let p of this.peers) {
            if(id===p.userData.id) {
                return p;
            }
        }
        console.log('peer for user id: "'+id+'" dose not exit');
        return undefined;
    }
    async setup() {
        this.worker = await createWorker({
            logLevel:"warn"
        })
        this.worker.on("died", (error) =>{
            console.error("mediasoup worker died!: ", error);
        });
        try {
            this.router = await this.worker.createRouter({mediaCodecs:this.mediaCodecs});
        } catch (error) {
            console.log("error on creating router:  "+error);
        }
    }


}

module.exports = Room;