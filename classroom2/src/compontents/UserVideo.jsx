import {useState, useEffect, createRef} from 'react';
import roomStyle from './roomStyle.module.css';
// import MicIcon from '@material-ui/icons/Mic';
import MicIcon from '@material-ui/icons/Mic'
import MicOffIcon from '@material-ui/icons/MicOff';
import VideocamIcon from '@material-ui/icons/Videocam';
import VideocamOffIcon from '@material-ui/icons/VideocamOff';

export default function UserVideo({videoStream, isTeacher, peer}) {

    const element = createRef();
    const [micStatus, setMicStatus] = useState(true);
    const [vidStatus, setVidStatus] = useState(true);
    
    useEffect(()=>{
        if(videoStream!==undefined) {
            element.current.srcObject = videoStream;
            console.log(isTeacher)
            if(isTeacher) {
                element.current.muted = true;
            }
        }
        
    }, [videoStream, micStatus, vidStatus]);

    function trunOnAndOffMic(value) {
        console.log(value)
        if(peer!=undefined) {
            if(peer.audioProducer!=undefined) {
                if(value===false) {
                    peer.audioProducer.pause();
                } else{
                    peer.audioProducer.resume(); 
                }
                setMicStatus(value)
            }  else {
                console.log("peer.audioProducer is undefined");
            }
        } else {
            console.log("peer is undefined!");
        }
    }
    function trunOnAndOffVid(value) {
        console.log(value);
        if(peer!=undefined) {
            if(peer.videoProducer!=undefined) {
                if(value===false) {
                    peer.videoProducer.pause();
                } else{
                    peer.videoProducer.resume(); 
                }
                setVidStatus(value);
            } else {
                console.log("peer.videoProducer is undefined");
            }

        } else {
            console.log("peer is undefined!");
        }
    }
    return(
        <div className={roomStyle.user_video}>
            <video autoPlay ref={element} className={roomStyle.user_video}></video>
            {isTeacher?
            <div className={roomStyle.user_mic}>
                {micStatus?<MicIcon className={roomStyle.user_mic_icon} onClick={()=>{trunOnAndOffMic(false)}}/>:<MicOffIcon className={roomStyle.user_mic_icon} onClick={()=>{trunOnAndOffMic(true)}}/>}
                {vidStatus?<VideocamIcon className={roomStyle.user_mic_icon} onClick={()=>{trunOnAndOffVid(false)}}/>:<VideocamOffIcon className={roomStyle.user_mic_icon} onClick={()=>{trunOnAndOffVid(true)}}/>}
            </div>:null}
        </div>
    );
}