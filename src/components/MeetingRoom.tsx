
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
import React, { useState,useRef,useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LayoutList, Users, Copy, FileText, MessageCircle } from "lucide-react"; // Copy is already imported
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

  const audioRef = useRef<MediaStreamAudioSourceNode | null>(null);
const mediaRecorderRef = useRef<MediaRecorder | null>(null);
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


  useEffect(() => {
  async function startAudioCapture() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = async (e) => {
      if (e.data.size > 0) {
        const reader = new FileReader();
        reader.readAsDataURL(e.data);
        reader.onloadend = async () => {
          const base64Audio = reader.result?.toString().split(",")[1];
          if (!base64Audio) return;

          // 1. Send to /api/transcribe
          const res = await fetch("/api/transcribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ audioBase64: base64Audio }),
          });
          const data = await res.json();
          const transcriptChunk = data.transcript;

          if (transcriptChunk?.trim()) {
            // 2. Send transcript chunk to /api/summary
            const summaryRes = await fetch("/api/summary", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ text: transcriptChunk }),
            });
            const summaryData = await summaryRes.json();
            setSummaryText(prev => prev + "\n" + summaryData.summary);
          }
        };
      }
    };

    // record small chunks every 10 seconds
    mediaRecorder.start(10000);
  }

  startAudioCapture();
}, []);

  const { useCallCallingState } = useCallStateHooks();
  const router = useRouter();
  const { id: meetingId } = useParams();

  // INVITE LINK IS HERE
  const inviteLink = `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${meetingId}`;

  const callingState = useCallCallingState();
  const call = useCall(); // <--- Get the current call object

  // 3. Get the Stream Chat client from the context (initialized in the provider)
  const { client: chatClient } = useChatContext();

  // 4. Define the channel ID based on the meeting ID
  const channelId = call?.id;

  // Use the chat client to get the channel
  const channel = chatClient.channel("livestream", channelId || "default", {});

  // ... (handleSummarize function remains the same)
 const handleSummarize = async () => {
  if (!meetingNotes.trim()) {
    toast("✍️ No notes to summarize!");
    return;
  }

  setIsSummarizing(true);
  setSummaryText("");

  try {
    const res = await fetch("/api/summary", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: meetingNotes }),
    });

    if (!res.ok) {
      // --- START: Improved Error Handling ---
      let errorText;
      try {
        // Try to read the response body as text (in case it's HTML/plain text error)
        errorText = await res.text();
      } catch (e) {
        // If reading the body fails, just log the status
        console.error(`API call failed with status: ${res.status}`);
      }

      console.error("Server Error Response:", errorText);

      // Provide a generic, friendly toast to the user
      toast("❌ Failed to generate summary. Check server logs or API key.");
      
      // Update state with a more informative message
      setSummaryText(`Error: Could not generate summary. Status ${res.status}.`);

      // Throw an error to halt the process (optional, but good practice)
      throw new Error(`API call failed with status: ${res.status}`);
      // --- END: Improved Error Handling ---
    }

    // Only attempt JSON parsing if the response status is OK (res.ok is true)
    const data = await res.json();
    setSummaryText(data.summary || "Failed to generate summary.");
    toast("📄 Summary generated successfully!");
  } catch (error) {
    // This catches network errors or the error thrown above
    console.error("Summarization fetch error:", error);
    if (!summaryText.startsWith("Error:")) { // Avoid overwriting specific error status
      setSummaryText("Error: An unknown network or client issue occurred.");
      toast("❌ An unexpected error occurred.");
    }
  } finally {
    setIsSummarizing(false);
  }
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
          {/* CallControls */}
          <CallControls onLeave={() => router.push("/")} />

          {/* Layout Dropdown Menu */}
          <DropdownMenu>
            <div className="flex items-center">
              <DropdownMenuTrigger className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]">
                <LayoutList size={20} className="text-white" />
              </DropdownMenuTrigger>
            </div>

            <DropdownMenuContent className="border-[#1C1F2E] bg-[#1C1F2E] text-white">
              {["Grid", "Speaker-left", "Speaker-right"].map((item, index) => (
                <div key={index}>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => {
                      setLayout(item.toLowerCase() as CallLayoutType);
                    }}
                  >
                    {item}
                  </DropdownMenuItem>
                </div>
              ))}
              <DropdownMenuSeparator />
            </DropdownMenuContent>
          </DropdownMenu>

          {/* CallStatsButton */}
          <CallStatsButton />

          {/* Summarize button */}
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
          
          {/* 👇 NEW Copy Invite Link Button */}
          <button
            onClick={() => {
              navigator.clipboard.writeText(inviteLink);
              toast("✅ Invite link copied!");
            }}
            className="flex items-center gap-2 rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]"
          >
            <Copy size={18} className="text-white" />
            <span>Copy Link</span>
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

          {/* EndCallButton */}
          {!isPersonalRoom && <EndCallButton />}
        </div>
      </div>
    </section>
  );
};

export default MeetingRoom;