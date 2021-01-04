
class Consumer {
    constructor(userData) {
        this.id = userData.id;
        this.userData = userData;
        this.audioConsumer = undefined;
        this.videoConsumer = undefined;

    }

    playPauseAudio(type) {
        if(this.audioConsumer!=undefined) {
            if(type==="play") {
                this.audioConsumer.resume();
            } else if(type==="pause") {
                this.audioConsumer.pause();
            }
        } else {
            console.log("can not pause or play audio bacause audioConsumer is undefined");
        }
    }

    playPauseVideo(type) {
        console.log(type);
        if(this.videoConsumer!=undefined) {
            if(type==="play") {
                this.videoConsumer.resume();
            } else if(type==="pause") {
                this.videoConsumer.pause();
            }
        } else {
            console.log("can not pause or play video bacause videoConsumer is undefined");
        }
    }

}

module.exports = Consumer;