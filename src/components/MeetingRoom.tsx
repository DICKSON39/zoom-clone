/* eslint-disable @typescript-eslint/no-unused-vars */
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
  // 1. Import Stream Video Hooks for Channel ID
  useCall,
} from "@stream-io/video-react-sdk";
import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LayoutList, Users, Copy, FileText, MessageCircle } from "lucide-react"; // Added MessageCircle icon
import { useRouter, useSearchParams, useParams } from "next/navigation";
import EndCallButton from "./EndCallButton";
import Loader from "./Loader";
import { toast } from "sonner";

// 2. Import Stream Chat components
import {
  Channel,
  MessageList,
  MessageInput,
  Window,
  useChatContext,
} from "stream-chat-react";

type CallLayoutType = "grid" | "speaker-left" | "speaker-right";

const MeetingRoom = () => {
  const searchParams = useSearchParams();
  const isPersonalRoom = !!searchParams.get("personal");
  const [layout, setLayout] = useState<CallLayoutType>("speaker-left");
  const [showParticipants, setShowParticipants] = useState(false);

  // State for showing the chat panel
  const [showChat, setShowChat] = useState(false); // <--- NEW STATE

  // ... (Summarization state and logic remains the same)

  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryText, setSummaryText] = useState("");
  const [meetingNotes] = useState(
    "The team discussed the Q3 marketing strategy. Key decisions included shifting focus from social media ads to influencer partnerships. Budget for the new campaign was approved at $50,000. Next steps: Sarah to contact the top three influencers, and John to finalize the creative assets. The next meeting is set for Friday to review progress."
  );

  const { useCallCallingState } = useCallStateHooks();
  const router = useRouter();
  const { id: meetingId } = useParams();

  const inviteLink = `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${meetingId}`;

  const callingState = useCallCallingState();
  const call = useCall(); // <--- Get the current call object

  // 3. Get the Stream Chat client from the context (initialized in the provider)
  const { client: chatClient } = useChatContext();

  // 4. Define the channel ID based on the meeting ID
  // Stream Chat channel ID and Stream Video call ID should typically be the same
  const channelId = call?.id;

  // Use the chat client to get the channel
  const channel = chatClient.channel("livestream", channelId || "default", {});

  // ... (handleSummarize function remains the same)
  const handleSummarize = async () => {
    /* ... existing logic ... */
  };

  if (callingState !== CallingState.JOINED || !channel) return <Loader />; // Add channel check

  const CallLayout = () => {
    // ... (existing layout logic)
    switch (layout) {
      case "grid":
        return <PaginatedGridLayout />;
      case "speaker-right":
        return <SpeakerLayout participantsBarPosition="left" />;
      default:
        return <SpeakerLayout participantsBarPosition="right" />;
    }
  };

  return (
    <section className="relative h-screen w-full overflow-hidden pt-4 text-white">
      <div className="relative flex size-full items-center justify-center">
        <div className="flex size-full max-w-[1000px] items-center">
          <CallLayout />
        </div>

        {/* Participants List Panel */}
        <div
          className={cn("h-[calc(100vh-86px)] hidden ml-2", {
            "show-block": showParticipants,
          })}
        >
          <CallParticipantsList onClose={() => setShowParticipants(false)} />
        </div>

        {/* 5. Chat Panel */}
        <div
          className={cn("h-[calc(100vh-86px)] hidden ml-2 w-80", {
            "show-block": showChat, // Show when showChat is true
          })}
        >
          {/* Channel component provides the chat context for MessageList/Input */}
          <Channel channel={channel}>
            <Window>
              <div className="relative flex flex-col h-full bg-[#1C1F2E] rounded-lg">
                <div className="text-lg font-semibold p-4 border-b border-gray-700 flex justify-between items-center">
                  Meeting Chat
                  <button
                    onClick={() => setShowChat(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    &times;
                  </button>
                </div>
                {/* MessageList displays the messages */}
                <div className="flex-grow overflow-y-auto">
                  <MessageList disableDateSeparator={true} />
                </div>
                {/* MessageInput allows sending new messages */}
                <div className="p-4 border-t border-gray-700">
                  <MessageInput />
                </div>
              </div>
            </Window>
          </Channel>
        </div>
      </div>

      <div className="fixed bottom-0 flex w-full flex-col items-center justify-center gap-2 pb-4">
        {/* ... (Summary Display Area remains the same) ... */}
        {summaryText && (
          <div className="w-full max-w-2xl rounded-lg bg-[#252a41] p-3 text-sm text-yellow-100 shadow-xl">
            <strong className="block mb-1">Meeting Summary:</strong>
            <p>{summaryText}</p>
          </div>
        )}

        <div className="flex w-full items-center justify-center gap-5 flex-wrap">
          {/* ... (CallControls, DropdownMenu, CallStatsButton remain the same) ... */}

          <CallControls onLeave={() => router.push("/")} />

          {/* ... (Layout Dropdown Menu) ... */}

          <CallStatsButton />

          {/* 3. Add Summarize button */}
          <button
            onClick={handleSummarize}
            disabled={isSummarizing}
            className={cn(
              "flex items-center gap-2 rounded-2xl px-4 py-2",
              isSummarizing
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-[#19232d] hover:bg-[#4c535b]"
            )}
          >
            <FileText size={18} className="text-white" />
            <span>{isSummarizing ? "Summarizing..." : "Summarize Notes"}</span>
          </button>

          {/* New Chat Toggle Button */}
          <button onClick={() => setShowChat((prev) => !prev)}>
            <div className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]">
              <MessageCircle size={20} className="text-white" />
            </div>
          </button>

          {/* Participants Toggle Button */}
          <button onClick={() => setShowParticipants((prev) => !prev)}>
            <div className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]">
              <Users size={20} className="text-white" />
            </div>
          </button>

          {/* ... (EndCallButton remains the same) ... */}
          {!isPersonalRoom && <EndCallButton />}
        </div>
      </div>
    </section>
  );
};

export default MeetingRoom;
