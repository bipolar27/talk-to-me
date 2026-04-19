/*import {and,eq,not} from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import {
     CallEndedEvent,
    // MessageNewEvent,
     CallTranscriptionReadyEvent,
    CallSessionParticipantLeftEvent,
     CallRecordingReadyEvent,
    CallSessionStartedEvent
} from "@stream-io/node-sdk";

import { db } from "@/db";
import {agents,meetings} from "@/db/schema";
import { streamVideo } from "@/lib/stream-video";
import { inngest } from "@/inngest/client";


function verifySignatureWithSDK(body:string,signature:string):boolean{
    return streamVideo.verifyWebhook(body,signature);
};

export async function POST(req:NextRequest){
    const signature = req.headers.get("x-signature");
    const apiKey = req.headers.get("x-api-key");

    if(!signature || !apiKey){
        return NextResponse.json(
            {error:"Missing signature or api key"},
            {status:400}
        );
    }

    const body =await req.text();

    if(!verifySignatureWithSDK(body,signature)){
        return NextResponse.json({error:"Invalid SIgnature"},{status:401})
    }
    let payload : unknown;
    try{
        payload = JSON.parse(body) as Record<string,unknown>;
    }catch{
        return NextResponse.json({error:"Invalid JSON"}, {status: 400});
    }

    const eventType = (payload as Record<string,unknown>)?.type;

    if(eventType ==="call.session_started"){
        const event = payload as CallSessionStartedEvent;
        const meetingId = event.call.custom?.meetingId;

        if(!meetingId){
            return NextResponse.json({error:"missing meetingId"},{status : 400});
        }

        const [existingMeeting] =await db
            .select()
            .from(meetings)
            .where(
                and(
                    eq(meetings.id,meetingId),
                    not(eq(meetings.status,"completed")),
                    not(eq(meetings.status,"active")),
                    not(eq(meetings.status,"cancelled")),
                    not(eq(meetings.status,"processing")),
                )
            );
            if(!existingMeeting){
                return NextResponse.json({error:"meeting Not Found"},{status:404});
            }

            await db    
                .update(meetings)
                .set({
                    status:"active",
                    startedAt:new Date()
                })
                .where(eq(meetings.id,existingMeeting.id));
            
            const [existingAgent] = await db    
                .select()
                .from(agents)
                .where(eq(agents.id,existingMeeting.agentId));
            
            if(!existingAgent){
                return NextResponse.json({error:"Agent Not Found"}, {status:404});
            }

            const call = streamVideo.video.call("default" , meetingId);

            const realtimeClient = await streamVideo.video.connectOpenAi({
                call,
                openAiApiKey : process.env.OPENAI_API_KEY!,
                agentUserId:existingAgent.id,
            });

            realtimeClient.updateSession({
                instructions:existingAgent.instructions,
            });
    }else if(eventType === "call.session_participant_left"){
        const event = payload as CallSessionParticipantLeftEvent;
        const meetingId = event.call_cid.split(":")[1];
        if(!meetingId){
            return NextResponse.json({error:"mMissing meetingId"},{status:400});
        }
        const call = streamVideo.video.call("default" , meetingId);
        await call.end();


    }else if(eventType==="call.session_ended"){
        const event=payload as CallEndedEvent;
        const meetingId=event.call.custom?.meetingId;

        if(!meetingId){
            return NextResponse.json({error:"mMissing meetingId"},{status:400});
    }
    await db    
                .update(meetings)
                .set({
                    status:"processing",
                    startedAt:new Date()
                })
                .where(and (eq(meetings.id,meetingId),eq(meetings.status,"active")));

    }else if (eventType === "call.transcription_ready") {
  const event = payload as CallTranscriptionReadyEvent;
  const meetingId = event.call_cid.split(":")[1]; // call_cid

  const [updatedMeeting] = await db
    .update(meetings)
    .set({
      transcriptUrl: event.call_transcription.url,
    })
    .where(eq(meetings.id, meetingId))
    .returning();

    if(!updatedMeeting){
            return NextResponse.json({error:" meeting not found"},{status:404});
    }
    await inngest.send({
        name:"meetings/processing",
        data:{
            meetingId:updatedMeeting.id,
            transcriptUrl:updatedMeeting.transcriptUrl,
        },
    });

}else if (eventType === "call.recording_ready") {
  const event = payload as CallRecordingReadyEvent;
  const meetingId = event.call_cid.split(":")[1]; // call_cid

  await db
    .update(meetings)
    .set({
      recordingUrl: event.call_recording.url,
    })
    .where(eq(meetings.id, meetingId));
}




    return NextResponse.json({status:"ok"});
}*//* import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { streamVideo } from "@/lib/stream-video";
import { db } from "@/db";
import { meetings } from "@/db/schema";

// 1. THE GLOBAL LOCK: This lives outside the function to track active agents
const activeConnections = new Set<string>();

export async function POST(req: NextRequest) {
    const body = await req.text();
    if (!body) return NextResponse.json({ status: "empty" });

    const payload = JSON.parse(body);

    if (payload.type === "call.session_started") {
        const meetingId = payload.call.custom?.meetingId;

        // 2. IMMEDIATE MEMORY CHECK (Faster than Database)
        if (activeConnections.has(meetingId)) {
            console.log(`>>> 🛑 BLOCKED DOUBLE AGENT for meeting: ${meetingId}`);
            return NextResponse.json({ status: "already_connecting" });
        }

        // 3. LOCK IT NOW
        activeConnections.add(meetingId);

        const [meeting] = await db.select().from(meetings).where(eq(meetings.id, meetingId));

        if (!meeting || meeting.status === "active") {
            // Clean up memory if DB says it's already done
            activeConnections.delete(meetingId);
            return NextResponse.json({ status: "already_active_in_db" });
        }

        await db.update(meetings).set({ status: "active" }).where(eq(meetings.id, meetingId));

        try {
            console.log(">>> 🚀 CONNECTING THE ONLY AGENT...");
            const call = streamVideo.video.call("default", meetingId);
            const ai = await streamVideo.video.connectOpenAi({
                call,
                openAiApiKey: process.env.OPENAI_API_KEY!,
                agentUserId: meeting.agentId,
            });

            await new Promise((r) => setTimeout(r, 2000));

            const send = (ai as any).send || (ai as any).sendJSON;
            if (send) {
                send.call(ai, {
                    type: "session.update",
                    session: {
                        instructions: "You are an English teacher. Start talking NOW.",
                        modalities: ["audio", "text"],
                        voice: "alloy",
                        turn_detection: { type: "server_vad" }
                    }
                });

                send.call(ai, { 
                    type: "response.create",
                    response: { modalities: ["audio"], instructions: "Say: 'Hello! I am your teacher. Only one of me is here now!'" }
                });
                console.log("✅ SUCCESS: AI IS SPEAKING");
            }
        } catch (e: any) {
            console.error(">>> AI FAILED:", e.message);
            // Remove from memory so you can try again
            activeConnections.delete(meetingId);
            await db.update(meetings).set({ status: "upcoming" }).where(eq(meetings.id, meetingId));
        }
    }

    return NextResponse.json({ status: "ok" });
}*/
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { streamVideo } from "@/lib/stream-video";
import { db } from "@/db";
import { meetings } from "@/db/schema";

const activeConnections = new Set<string>();

export async function POST(req: NextRequest) {
    const body = await req.text();
    if (!body) return NextResponse.json({ status: "empty" });

    const payload = JSON.parse(body);

    if (payload.type === "call.session_started") {
        const meetingId = payload.call.custom?.meetingId;

        if (activeConnections.has(meetingId)) return NextResponse.json({ status: "busy" });
        activeConnections.add(meetingId);

        const [meeting] = await db.select().from(meetings).where(eq(meetings.id, meetingId));
        if (!meeting || meeting.status === "active") {
            activeConnections.delete(meetingId);
            return NextResponse.json({ status: "skip" });
        }

        await db.update(meetings).set({ status: "active" }).where(eq(meetings.id, meetingId));

        try {
            console.log(">>> [FORCING] AI CONNECTION START");
            const call = streamVideo.video.call("default", meetingId);
            const ai = await streamVideo.video.connectOpenAi({
                call,
                openAiApiKey: process.env.OPENAI_API_KEY!,
                agentUserId: meeting.agentId,
            });

            // Universal Trigger Function
            const forceSpeech = (agent: any) => {
                const messenger = agent.send || agent.sendJSON || (agent.socket?.send ? (d: any) => agent.socket.send(JSON.stringify(d)) : null);
                
                if (messenger) {
                    const data = {
                        type: "response.create",
                        response: {
                            modalities: ["audio", "text"],
                            instructions: "Say exactly this: 'Hello! I am your teacher. I am working now. Can you hear me?'"
                        }
                    };
                    
                    // Try both direct call and socket send
                    if (agent.socket?.send) {
                        agent.socket.send(JSON.stringify(data));
                    } else {
                        messenger.call(agent, data);
                    }
                    console.log("✅ [COMMAND] Speech signal sent to OpenAI");
                }
            };

            // Attempt 1: Immediate
            forceSpeech(ai);

            // Attempt 2: After 3 seconds (The 'warmup' retry)
            setTimeout(() => forceSpeech(ai), 3000);

        } catch (e: any) {
            console.error(">>> [FAIL]:", e.message);
            activeConnections.delete(meetingId);
        }
    }
    return NextResponse.json({ status: "ok" });
}
