"use client";

import { cn } from "@/lib/utils";
import {
  CallControls,
  CallParticipantsList,
  CallStatsButton,
  PaginatedGridLayout,
  SpeakerLayout,
  useCallStateHooks,
  CallingState,
} from "@stream-io/video-react-sdk";
import React, { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LayoutList, Users, Copy, MessageCircle } from "lucide-react";
import { useRouter, useSearchParams, useParams } from "next/navigation";

import { toast } from "sonner";

import { Channel as StreamChannel } from "stream-chat";
import { Channel, MessageList, MessageInput, useChatContext } from "stream-chat-react";
import EndCallButton from "@/components/EndCallButton";
import Loader from "@/components/Loader";

type CallLayoutType = "grid" | "speaker-left" | "speaker-right";

const MeetingRoom = () => {
  const searchParams = useSearchParams();
  const isPersonalRoom = !!searchParams.get("personal");
  const [layout, setLayout] = useState<CallLayoutType>("speaker-left");
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [channel, setChannel] = useState<StreamChannel | null>(null);

  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();

  const { client: chatClient } = useChatContext(); // Always called first

  const router = useRouter();
  const { id: meetingIdParam } = useParams();

  // Type-safe meetingId
  const meetingId =
    typeof meetingIdParam === "string"
      ? meetingIdParam
      : Array.isArray(meetingIdParam)
      ? meetingIdParam[0]
      : undefined;

  
      const inviteLink = `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${meetingId}`;

        useEffect(() => {
    const ch = chatClient.channel("messaging", meetingId);
    ch.watch();
    setChannel(ch);

    return () => {
      ch.stopWatching();
    };
  }, [chatClient, meetingId]);

  const CallLayout = () => {
    switch (layout) {
      case "grid":
        return <PaginatedGridLayout />;
      case "speaker-right":
        return <SpeakerLayout participantsBarPosition="left" />;
      default:
        return <SpeakerLayout participantsBarPosition="right" />;
    }
  };



  // Early return if necessary
  if (!meetingId || callingState !== CallingState.JOINED || !chatClient) return <Loader />;

  // Setup chat channel

  return (
    <section className="relative h-screen w-full overflow-hidden pt-4 text-white flex">
      {/* Video Area */}
      <div className="flex-1 relative flex items-center justify-center">
        <div className="flex w-full max-w-[1000px] items-center">
          <CallLayout />
        </div>

        {/* Participants List */}
        <div
          className={cn(
            "h-[calc(100vh-86px)] ml-2 transition-all duration-300 absolute right-0 top-0 z-20 bg-[#1C1F2E]",
            {
              hidden: !showParticipants,
              block: showParticipants,
            }
          )}
        >
          <CallParticipantsList onClose={() => setShowParticipants(false)} />
        </div>

        {/* Chat Sidebar */}
        {showChat && channel && (
          <div className="w-[300px] h-full absolute right-0 top-0 z-20 bg-[#1C1F2E] flex flex-col">
            <Channel channel={channel}>
              <MessageList />
              <MessageInput />
            </Channel>
          </div>
        )}

        {/* Bottom Controls */}
        <div className="fixed bottom-0 flex w-full items-center justify-center gap-5 flex-wrap z-30">
          <CallControls onLeave={() => router.push("/")} />

          {/* Layout Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]">
              <LayoutList size={20} />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="border-[#1C1F2E] bg-[#1C1F2E] text-white">
              {["Grid", "Speaker-left", "Speaker-right"].map((item, index) => (
                <DropdownMenuItem
                  key={index}
                  className="cursor-pointer"
                  onClick={() =>
                    setLayout(item.toLowerCase() as CallLayoutType)
                  }
                >
                  {item}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
            </DropdownMenuContent>
          </DropdownMenu>

          <CallStatsButton />

          {/* Copy Invite */}
          <button
            onClick={() => {
              navigator.clipboard.writeText(inviteLink);
              toast("✅ Invite link copied!");
            }}
            className="flex items-center gap-2 rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]"
          >
            <Copy size={18} />
            Copy Invite
          </button>

          {/* Toggle Participants */}
          <button
            onClick={() => setShowParticipants((prev) => !prev)}
            className="rounded-2xl bg-[#19232d] p-2 hover:bg-[#4c535b]"
          >
            <Users size={20} />
          </button>

          {/* Toggle Chat */}
          <button
            onClick={() => setShowChat((prev) => !prev)}
            className="rounded-2xl bg-[#19232d] p-2 hover:bg-[#4c535b]"
          >
            <MessageCircle size={20} />
          </button>

          {!isPersonalRoom && <EndCallButton />}
        </div>
      </div>
    </section>
  );
};

export default MeetingRoom;
