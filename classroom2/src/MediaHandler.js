export default class MediaHandler {

    getAV() {
        let video_constraints = {
            mandatory: {
              maxHeight: 480,
              maxWidth: 640 
            },
            optional: []
          };
        return new Promise((res, rej)=>{
            navigator.mediaDevices.getUserMedia({video:video_constraints, audio:true})
            .then((stream)=>{
                res(stream)
            })
            .catch((err)=>{
                rej("unable to get stream: ");
                // throw new Error("unable to get stream: " + err);
            })
        })
    }

    getScreen() {
        return new Promise((res, rej)=>{
            navigator.mediaDevices.getDisplayMedia({cursor:true})
            .then(stream=>{
                // const screenTrack= stream.getTracks()[0];
                res(stream);
            })
            .catch((err)=>{
                throw new Error("Screen Stream Error: "+ err);
            })
        })
    }

}