"use client";

import { authClient } from "@/lib/auth-client"; //import the auth client
import { Button } from "@/components/ui/button";
import {useRouter} from "next/navigation";

export const HomeView=() =>{
    const router=useRouter();
   const {data :session}=authClient.useSession();


  if(!session){
    return(
      <p>Loading.....</p>
    )
  }
   return(
     <div className = "flex flex-col p-4 gap-4-y">
        <p>logged in as {session.user.name}</p>
        <Button onClick={()=>authClient.signOut({
            fetchOptions:{
                onSuccess:()=>router.push("/sign-in")

            }
        })
    }>
          SignOut
        </Button>
      </div>
    )
  }

 
