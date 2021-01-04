import React from 'react';
import MediaHandler from '../MediaHandler';
import UserVideo from './UserVideo';
// import RemoteVideo from './RemoteVideo';
import VideoBar from './VideoBar';
import io from 'socket.io-client';
import { Device } from 'mediasoup-client';
import { Router } from 'react-router-dom';
import Peer from './Peer';
import { getUser } from "../api/api";
import Topbar from './Topbar.jsx'

export default class Room extends React.Component {

    state = {
        isTeacher:false,
        teacherStream:undefined,
        teacherData:undefined
    }
    socket = undefined;
    device = undefined;
    sendTransport = undefined;
    receiveTransport = undefined;
    peer = undefined;
    stream = undefined;
    remoteVideos = [];
    connectNum = 0;
    connectWithServer = (stream, userData)=>{
        this.stream = stream;
        this.socket = io.connect("http://localhost:3000");
        this.socket.on('connect', ()=>{
            console.log("socket connected =================> with id"+this.socket.id);
            console.log(this.connectNum);
            if(this.connectNum!==0) {
                this.socket.emit("reconnected", {userId:userData.id, roomId:this.props.match.params.roomId});
            }
            this.connectNum++;
        });
        this.peer = new Peer(this.socket, userData, this.device);
        let data = {userData:userData, roomId:this.props.match.params.roomId};
        if(userData.type==="teacher") {
            this.socket.emit("create_room", data);
            this.setTeacherDetail({isTeacher:true, teacherStream:stream, teacherData:userData});
        } else {
            this.socket.emit("join_room", data);
        }

        this.socket.on("routerRtpCapabilities", this.handleRouterCapabilities);
        this.socket.on("user-join", this.handleJoinUser);
        this.isFirstRender = false;
        // this.socket.on("test", (data)=>{
        //     console.log("data: "+data);
        // });
        this.socket.on("test", (data)=>{
            console.log("data2: "+data);
        });
        // this.type = type;

    }
    setTeacherDetail = ({isTeacher, teacherStream, teacherData})=>{
        console.log(isTeacher, teacherData, teacherStream);
        this.setState((prev)=>{
            return {...prev, isTeacher, teacherStream, teacherData};
        });
    }
    handleRouterCapabilities = (routerRtpCapabilities)=>{
        console.log(this.device);
        this.device.load({routerRtpCapabilities})
        .then(()=>{
            this.peer.createTransports(this.stream);
        })
        .catch((err)=>{
            console.log(`error in loading device: ${err}`)
        });
    }
    handleJoinUser = (userData)=>{
        console.log("new user join with id: "+userData.id);
        this.peer.connectWithUser(userData);
        // this.peer.consumeStream();
    }
   
    componentDidMount =()=>{
        let mediaHandler = new MediaHandler();
        this.device = new Device();
        // try {
        // } catch(err) {
        //     console.log(err);
        // }
       
        let roomId = this.props.match.params.roomId;
        getUser(roomId, this.props.userType)
        .then((res)=>{
            mediaHandler.getAV()
            .then((stream)=>{
                this.connectWithServer(stream, res)
            })
        })
        .catch((err)=>{
            console.log(err);
        })
        window.document.addEventListener("gotTeacher", (event)=>{this.setTeacherDetail(event.data)});
    }
    componentWillUnmount = ()=>{
        window.document.removeEventListener("gotTeacher", this.setTeacherDetail);
    }
    test = ()=>{
        this.socket.emit("test", "client testing");
    }
    render() {
        console.log(this.state);
        return(
            <div>
                <Topbar teacherData={this.state.teacherData} />
                <UserVideo videoStream={this.state.teacherStream} isTeacher={this.state.isTeacher} peer={this.peer}/>
                <button onClick={this.test}>test</button>
                {/* <RemoteVideo videoStream={this.state.remoteVideo}/> */}
                <VideoBar/>
               
            </div>
        );
    }
}