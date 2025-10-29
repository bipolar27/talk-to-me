import { useState } from "react";
import {
  StreamTheme,
  useStreamVideoClient,
  StreamCall,
} from "@stream-io/video-react-sdk";
import { CallLobby } from "./call-lobby";
import { CallActive } from "./call-active";
import { CallEnded } from "./call-ended";

interface Props {
  meetingName: string;
}

export const CallUI = ({ meetingName }: Props) => {
  const [show, setShow] = useState<"lobby" | "call" | "ended">("lobby");
  const [activeCall, setActiveCall] = useState<any>(null);
  const client = useStreamVideoClient();

  const handleJoin = async () => {
    if (!client) {
      console.error("Stream client not ready yet");
      return;
    }

    try {
      // ✅ Create or fetch the call
      const call = client.call("default", meetingName);
      await call.getOrCreate();
      await call.join();

      // ✅ Save the call reference in state
      setActiveCall(call);
      setShow("call");
    } catch (err) {
      console.error("❌ Failed to join call:", err);
    }
  };

  const handleLeave = async () => {
    try {
      if (activeCall) {
        await activeCall.endCall();
      }
    } catch (err) {
      console.error("❌ Failed to end call:", err);
    } finally {
      setShow("ended");
    }
  };

  return (
    <StreamTheme className="h-full">
      {show === "lobby" && <CallLobby onJoin={handleJoin} />}

      {/* ✅ Wrap active view in <StreamCall> so it stays registered */}
      {show === "call" && activeCall && (
        <StreamCall call={activeCall}>
          <CallActive onLeave={handleLeave} meetingName={meetingName} />
        </StreamCall>
      )}

      {show === "ended" && <CallEnded />}
    </StreamTheme>
  );
};
