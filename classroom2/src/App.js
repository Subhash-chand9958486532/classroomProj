import {useState, useEffect} from "react";
import './App.css';
import Room from './compontents/Room'
import {Route, Switch, useHistory} from "react-router-dom";

export default function App() {

  const [userType, setUserType] = useState("student");
  const history = useHistory();
  function createRoom() {
    setUserType("teacher");
    history.push("/room/send");
  }
  return (
    <div className="App">
        <Switch>
            <Route path="/" exact >
               <button onClick={()=>{createRoom()}}>createRoom</button>
            </Route>
            <Route path="/room/:roomId" render={(props)=><Room userType={userType} {...props}/>}/>
        </Switch>
        
    </div>
  );
}

