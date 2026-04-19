"use client";

import Link from "next/link";
import Image from "next/image";
import {
  CallControls,
  SpeakerLayout,
} from "@stream-io/video-react-sdk";

interface Props {
  onLeave: () => void;
  meetingName: string;
}

export const CallActive = ({ onLeave, meetingName }: Props) => {
  return (
    <div className="flex flex-col justify-between p-4 h-full text-white">
      <div className="bg-[#101213] rounded-full p-4 flex items-center gap-4">
        <Link
          href="/"
          className="flex items-center justify-center p-1 bg-white/10 rounded-full w-fit"
        >
          <Image src="/logo.svg" width={22} height={22} alt="Logo" />
        </Link>
        <h4 className="text-base">{meetingName}</h4>
      </div>

      <SpeakerLayout />

      <div className="bg-[#101213] rounded-full px-4">
        <CallControls   onLeave={onLeave}/>
      </div>
    </div>
  );
};
/*import { SpeakerLayout, CallControls, CallingState, useCall, useCallStateHooks } from "@stream-io/video-react-sdk";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export const CallActive = ({ onLeave }: { onLeave: () => void, meetingName: string }) => {
  const call = useCall();
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();

  useEffect(() => {
    return () => { call?.leave(); }; // Vital cleanup
  }, [call]);

  if (callingState !== CallingState.JOINED) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-full bg-black gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-green-500" />
        <p className="text-white font-medium">Connecting to AI Agent...</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col bg-black">
      <SpeakerLayout participantsBarPosition="bottom" />
      <div className="p-4 flex justify-center"><CallControls onLeave={onLeave} /></div>
    </div>
  );
};*/