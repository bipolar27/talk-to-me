import Link from "next/link";
import { LogInIcon } from "lucide-react";
import {
  DefaultVideoPlaceholder,
  StreamVideoParticipant,
  ToggleAudioPreviewButton,
  ToggleVideoPreviewButton,
  useCallStateHooks,
  VideoPreview,
} from "@stream-io/video-react-sdk";


import { authClient } from "@/lib/auth-client";
import { generateAvatarUri } from "@/lib/avatar";
import {Button } from "@/components/ui/button";
import "@stream-io/video-react-sdk/dist/css/styles.css";


interface Props{
    onJoin:()=> void;

};
const DisabledVideoPreview = () => {
    const{data}=authClient.useSession();
  return (
    <DefaultVideoPlaceholder
      participant={{
        name: data?.user.name ?? "",
        image:
          data?.user.image ??
          generateAvatarUri({
            seed: data?.user.name ?? "",
            variant: "initials",
          }),
      }as StreamVideoParticipant
    }
    />
  )
}
const AllowBrowserPermissions = () => {
  return (
    <p className="text-sm">
      Please grant your browser a permission to access your camera and
      microphone.
    </p>
  );
};


export const CallLobby = ({ onJoin }: Props) => { 
  const { useCameraState, useMicrophoneState } = useCallStateHooks();

  const { hasBrowserPermission: hasMicPermission } = useMicrophoneState();
  const { hasBrowserPermission: hasCameraPermission } = useCameraState();

  const hasBrowserMediaPermission = hasCameraPermission && hasMicPermission;

  return (
    <div className="flex flex-col items-center justify-center h-full bg-radial from-sidebar-accent to-sidebar">
      <div className="py-4 px-8 flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center justify-center gap-y-6 bg-background rounded-lg p-10 shadow-sm">
  <div className="flex flex-col gap-y-2 text-center">
    <h6 className="text-lg font-medium">Ready to join?</h6>
    <p className="text-sm">Set up your call before joining</p>
  </div>
  <VideoPreview
 
  DisabledVideoPreview={
    hasBrowserMediaPermission ? DisabledVideoPreview : AllowBrowserPermissions
  }
/>
<div className="flex gap-x-2">
  <ToggleAudioPreviewButton />
  <ToggleVideoPreviewButton />
</div>

<div className="flex gap-x-2 justify-between w-full">
  <Button asChild variant="ghost">
    <Link href="/meetings">
      Cancel
    </Link>
  </Button>

  <Button
    onClick={onJoin}>

    <LogInIcon />
    Join Call
  </Button>
</div>


  
    </div>

      </div>
    </div>
  );
};
/*import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface Props {
  onJoin: () => void;
  isJoining: boolean; // Add this line
}

export const CallLobby = ({ onJoin, isJoining }: Props) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-black text-white gap-6">
      <h1 className="text-3xl font-bold">Ready to join?</h1>
      <p className="text-muted-foreground">The AI Agent is prepared for the session.</p>
      
      <Button 
        onClick={onJoin} 
        disabled={isJoining} // Disable button while joining
        size="lg"
        className="w-40 bg-green-600 hover:bg-green-700"
      >
        {isJoining ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Joining...
          </>
        ) : (
          "Join Meeting"
        )}
      </Button>
    </div>
  );
};*/