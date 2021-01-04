import {useRef, useEffect, useState, createRef} from "react";
import roomStyle from './roomStyle.module.css';

export default function RemoteVideo({consumer}) {

    const element = createRef();
    useEffect(()=>{
        console.log(consumer.id);
        if(consumer!==undefined) {
            console.log(consumer.audioConsumer);
            if(consumer.audioConsumer!=undefined && consumer.videoConsumer!=undefined) {
                let mediaStream = new MediaStream([consumer.audioConsumer.track, consumer.videoConsumer.track]);
                element.current.srcObject = mediaStream;
            }
        }

    });
    function playPause(type) {
        consumer.playPauseVideo(type);
    }
    return(
        <div>
            <video autoPlay ref={element} className={roomStyle.remote_video}></video>
            <button onClick={()=>{playPause("play")}}>send test message</button>
        </div>
    );
}