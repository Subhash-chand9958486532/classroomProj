let url = "http://localhost:8000/user";


export let getUser = (async(roomId, type)=>{
        let res = await fetch(`${url}/${type}`);
        let data = await res.json();
        return data;
        
})

// export let getUserClient = (async(roomId, type)=>{
//     try {
//         let res = await fetch(`${url}/${type}`);
//         let data = await res.json();
//         // console.log(data);
//         return data;
        
//     } catch (error) {
//         console.log("error in fatching api"+error);
//     }
// })
