import { render } from '@testing-library/react';
import { DataConsumer } from 'mediasoup-client/lib/types';
import React from 'react';
import Consumer from './Consumer';
import RemoteVideo from './RemoteVideo';
export default class extends React.Component {
    state = {
        consumers:[]
    }
    // peer = this.props.peer;
    isUpdtaed = false;
    gotNewConsumer = (e)=>{
        console.log("======================================================================> consumer occured")
        // setTimeout(()=>{
           
        // }, 4000);
        console.log(this.isUpdtaed);
        if(this.isUpdtaed) {
            this.isUpdtaed = false;
            this.setState((prev)=>{
                let consumers = [...e.data.consumers]
                
                return {...prev, consumers:consumers};
            }); 
            
        }
    }
    componentDidMount() {
        

        // let remoteVideos = this.props.videos;
        window.document.addEventListener("gotStream", this.gotNewConsumer);
        this.isUpdtaed = true;
        // this.peer.gotNewVideo = this.gotNewVideo;
    }
    componentDidUpdate() {
        this.isUpdtaed = true;
        // console.log(this.state.remoteVideos);
    }
    componentWillUnmount() {
        window.document.removeEventListener("gotStream", this.gotNewVideo);
    }
    render() {
        
        console.log("rendering -------------------__>")
        return(
            <div >
                {this.state.consumers.map((consumer)=>{
                    return(
                        <RemoteVideo key={consumer.id} consumer={consumer}/>
                    );
                })}
            </div>
        );
    }
}