import {useState, useEffect} from 'react';
import roomStyle from './roomStyle.module.css';


export default function Topbar({teacherData}) {
    // console.log(teacherData)
    // if(teacherData==undefined) {
    //     return(
    //         null
    //     );
    // }
    return(
        <div className={roomStyle.top_bar}>
            <span>Time slot: 12PM-1PM</span>
            <span>Class: {teacherData!=undefined?teacherData.class:null}</span>
            <span>Live classroom: session by Mr. {teacherData!=undefined?teacherData.name:null}</span>
            <span>subject: Mathamatics</span>
        </div>
    );
}