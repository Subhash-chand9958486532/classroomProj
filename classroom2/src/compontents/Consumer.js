
class Consumer {
    constructor(userData, peer) {
        this.id = userData.id;
        this.userData = userData;
        this.peer = peer;
        this.audioConsumer = undefined;
        this.videoConsumer = undefined;
    }

    playPauseAudio(type) {
        if(this.audioConsumer!=undefined) {
            this.peer.socket.emit("play-pause-audio", {type:type, id:this.id});
        } else {
            console.log("can not pause or play audio bacause audioConsumer is undefined");
        }
    }

    playPauseVideo(type) {
        if(this.videoConsumer!=undefined) {
            this.peer.socket.emit("play-pause-video", {type:type, id:this.id});
        } else {
            console.log("can not pause or play video bacause videoConsumer is undefined");
        }
    }

}

export default Consumer;