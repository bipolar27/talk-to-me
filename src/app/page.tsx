"use client";

import { authClient } from "@/lib/auth-client"; //import the auth client
import { Button } from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {useState} from "react";

export default function Home() {

  const { 
        data: session, 
    } = authClient.useSession() 


  const [name,setName]  = useState("");
  const [email,setEmail]  = useState("");
  const [password,setPassword]  = useState("");
  const onSubmit = () => {
    authClient.signUp.email({
      email,name,password,
    }, {
        onSuccess: () => {
            window.alert("Success");
        },
        onError: () => {
            // display the error message
            window.alert("Something is Wrong");
        },
      }
      );
  }

  const onLogin = () => {
    authClient.signIn.email({
      email,password,
    }, {
        onSuccess: () => {
            window.alert("Success");
        },
        onError: () => {
            // display the error message
            window.alert("Something is Wrong");
        },
      }
      );
  }
  
  if(session){
    return(
      <div className = "flex flex-col p-4 gap-4-y">
        <p>logged in as {session.user.name}</p>
        <Button onClick={()=>authClient.signOut()}>
          SignOut
        </Button>
      </div>
    )
  }

  return (
    <div className="p-4 flex flex-col gap-y-10">
      <div className ="p-4 flex flex-col gap-y-4">
        <Input 
          placeholder="name" 
          value={name} 
          onChange={(e)=>setName(e.target.value)}/>
        <Input 
          placeholder="email" 
          value={email} 
          onChange={(e)=>setEmail(e.target.value)}/>
        <Input 
          placeholder="password" 
          type= "password" value={password} 
          onChange={(e)=>setPassword(e.target.value)}/>

        <Button onClick={onSubmit}>
          Create User
        </Button>
      </div>
        <div className ="p-4 flex flex-col gap-y-4">

        <Input 
          placeholder="email" 
          value={email} 
          onChange={(e)=>setEmail(e.target.value)}/>
        <Input 
          placeholder="password" 
          type= "password" value={password} 
          onChange={(e)=>setPassword(e.target.value)}/>

        <Button onClick={onLogin}>
          Login
        </Button>
      </div>
     </div>
  );
}
