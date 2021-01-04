const express = require("express");
const port = process.env.PORT || 8000;
const http = require("http");
const socket = require("socket.io");
const mediasoup = require("mediasoup");
const Peer = require("./peer");
const Room = require("./room");
// const { workers } = require("cluster");
// const {
//     types,
//     version,
//     observer,
//     createWorker,
//     getSupportedRtpCapabilities,
//     parseScalabilityMode
// } = require("mediasoup");

// let worker = await createWorker();

// console.log(mediasoup.version);
// console.log(worker);
const app = express();
const server = http.createServer(app)
const io = socket(server);


const siteRoute = express.Router();
let idNum = 10;
siteRoute.get('/:type', (req, res, next)=>{
  // let room = checkRoomExist(req.params.roomId);
  // if(room==undefined) {
  //   let newRoom = new Room(req.params.roomId);
  //   newRoom.setup()
  //   .then(()=>{
      
  //   });
  // } else {

  // }
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  let type = req.params.type
  idNum++;
  res.status(200).json({
    type: type,
    name:"pawan",
    class:"10", 
    id:idNum,
  });

})

// app.use((req, res, next)=>{
//   res.status(200).json({
//     message: "it worked"
//   });
// });
app.use('/user', siteRoute);

let rooms = [];
function checkRoomExist(roomId) {
  for(let r of rooms) {
    if(r.id===roomId) {
      return r;
    }
  }
  return undefined;
}



io.on("connection", (socket)=>{ 

  console.log("new socket connected");
  socket.on("create_room", ({userData, roomId})=>{
    let room= checkRoomExist(roomId);
    // whole logic would be changed
    if(room==undefined) {
      room = new Room(roomId);
    } else {
      room = new Room(roomId);
      rooms = [];
      console.log("empty room");
    }
    //
    room.setup()
    .then(()=>{
      socket.join(room.id);
      let peer = new Peer(socket, userData, room.router, io, room);
      room.addPeer(peer);
      io.to(socket.id).emit("routerRtpCapabilities", room.router.rtpCapabilities);
    })
    rooms.push(room);
  });

  socket.on("join_room", ({userData, roomId})=>{
    let room = checkRoomExist(roomId);
    console.log("joining room");
    if(room!=undefined) {
      socket.join(room.id);
      let peer = new Peer(socket, userData, room.router, io, room);
      room.addPeer(peer);
      io.to(socket.id).emit("routerRtpCapabilities", room.router.rtpCapabilities);
    } else {
      console.log(`room with id: "${roomId}" dose not exist`);
    }
    
  });

  socket.on('reconnected', ({userId, roomId})=>{
    let room = checkRoomExist(roomId);
    if(room!=undefined) {
      let peer = room.getPeer(userId);
      if(peer!=undefined) {
        socket.join(room.id);
        peer.resetSocket(socket)
        console.log("change successfully");
        
      } else {
        console.log('peer dose not exit with user id '+userId);  
      }
    } else {
      console.log('room dose not exit with room id '+roomId);
    }
  });
  
  socket.on("disconnect", (reason) => {
    console.log("socket disconnect with id: "+socket.id +" and reason "+reason);
  });

});



// let worker, router, sendTransport, recTransport, producer, consumer;

// (async()=>{
//   worker = await mediasoup.createWorker({
//     logLevel: "warn",
//   });
//   worker.on("died", (error) =>{
//   console.error("mediasoup worker died!: %o", error);
//   });
//   const mediaCodecs =[
//   {
//     "kind": "audio",
//     "mimeType": "audio/opus",
//     "clockRate": 48000,
//     "channels": 2
//   },
//   {
//     "kind": "video",
//     "mimeType": "video/VP8",
//     "clockRate": 90000,
//     "parameters": {

//     }
//   },
//   {
//     "kind": "video",
//     "mimeType": "video/H264",
//     "clockRate": 90000,
//     "parameters": {
//         "packetization-mode": 1,
//         "profile-level-id": "4d0032",
//         "level-asymmetry-allowed": 1
//     }
//   },
//   {
//     "kind": "video",
//     "mimeType": "video/H264",
//     "clockRate": 90000,
//     "parameters": {
//         "packetization-mode": 1,
//         "profile-level-id": "42e01f",
//         "level-asymmetry-allowed": 1
//     }
//   }
//   ]
//   try {
//   router = await worker.createRouter({mediaCodecs});
//   } catch(err) {
//   console.log("erron on creating router: " + err);
//   }

// })();

// io.on("connection", (socket)=>{
//     console.log("new connection");

//     socket.on("create_room", (roomId)=>{
//         room.push(roomId);
//         // console.log(router);
//         io.to(socket.id).emit("rtpCapabilities", router.rtpCapabilities);
//     });

//     socket.on("createSendTransport", ()=>{
//       (async()=>{
//           sendTransport = await router.createWebRtcTransport({
//           listenIps : [ { ip: "192.168.2.147"} ],
//           enableUdp : true,
//           enableTcp : true,
//           enableSctp:true
//         });
//         let data = {
//           id:sendTransport.id,
//           iceParameters:sendTransport.iceParameters,
//           iceCandidates:sendTransport.iceCandidates,
//           dtlsParameters:sendTransport.dtlsParameters,
//           sctpParameters:sendTransport.sctpParameters
//       };
//         console.log("request completed");
//         io.to(socket.id).emit("transportCreated", data);
//       })();
      
//       socket.on("transport-connect", (data)=>{
//         let dtlsParameters = data.dtlsParameters
//         sendTransport.connect({dtlsParameters})
//         .then(()=>{
//           console.log("connecting to transport");
//           io.to(socket.id).emit("transport-connected", null);
//         })
//         .catch((err)=>{
//           console.log("error in connecting send transport: "+err);
//         })
//       });
     

//       socket.on("produce", (produceData)=>{
//         (async()=>{
//           producer = await sendTransport.produce({
//               kind:produceData.kind,
//               rtpParameters:produceData.rtpParameters,
//           });
//           console.log("=================== on producing");
//           io.to(socket.id).emit("produceDone", producer.id);
//         })()
//         .catch((err)=>{
//           console.log(err);
//         });
//       })

//     });
//     socket.on("createRecTransport", ()=>{
//       (async()=>{
//         recTransport = await router.createWebRtcTransport({
//         listenIps : [ { ip: "192.168.2.147"} ],
//         enableUdp : true,
//         enableTcp : true,
//         enableSctp:true
//       });
//       let data = {
//         id:recTransport.id,
//         iceParameters:recTransport.iceParameters,
//         iceCandidates:recTransport.iceCandidates,
//         dtlsParameters:recTransport.dtlsParameters,
//         sctpParameters:recTransport.sctpParameters
//       };
//         console.log("request rec completed");
//         io.to(socket.id).emit("recTransportCreated", data);
//       })();

//       socket.on("rec-transport-connect", (data)=>{
//         let dtlsParameters = data.dtlsParameters
//         console.log("rece trasport connectd")
//         recTransport.connect({dtlsParameters})
//         .then(()=>{
//           console.log("connecting to  rec transport");
//           io.to(socket.id).emit("rec-transport-connected", null);
//         })
//         .catch((err)=>{
//           console.log("error in connecting send transport: "+err);
//         })
//       });
//       socket.on("consume", (devicertpCapabilities)=>{

//         if(router.canConsume({producerId:producer.id, rtpCapabilities:devicertpCapabilities})){
//           (async()=>{
//             consumer = await recTransport.consume({ 
//               producerId:producer.id,
//               rtpCapabilities:devicertpCapabilities,
//               paused:true
//             });
//             let data = {
//               id: consumer.id,
//               producerId:consumer.producerId,
//               kind:consumer.kind,
//               rtpParameters:consumer.rtpParameters,
//               transportData:{
//                   id:recTransport.id,
//                   iceParameters:recTransport.iceParameters,
//                   iceCandidates:recTransport.iceCandidates,
//                   dtlsParameters:recTransport.dtlsParameters,
//                   sctpParameters:recTransport.sctpParameters
//                 }
//               }
//             io.to(socket.id).emit("createConsumer", data);
//             socket.on("consumer_created", ()=>{
//               console.log("consumer resuming");
//               consumer.resume();
//             })
//           })();

//         }
//       })
//     })

// })


  




server.listen(8000, ()=>{
    console.log("server is running at port 8000");
});