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
import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LayoutList, Users, Copy } from "lucide-react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import EndCallButton from "./EndCallButton";
import Loader from "./Loader";
import { toast } from "sonner";

type CallLayoutType = "grid" | "speaker-left" | "speaker-right";

const MeetingRoom = () => {
  const searchParams = useSearchParams();
  const isPersonalRoom = !!searchParams.get("personal");
  const [layout, setLayout] = useState<CallLayoutType>("speaker-left");
  const [showParticipants, setShowParticipants] = useState(false);

  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();

  const router = useRouter();
  const { id: meetingId } = useParams();
  const inviteLink = `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${meetingId}`;

  // Early return loader if call not joined yet
  if (callingState !== CallingState.JOINED) return <Loader />;

  // Layout component based on selected layout
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

  return (
    <section className="relative h-screen w-full overflow-hidden pt-4 text-white">
      <div className="relative flex w-full items-center justify-center">
        <div className="flex w-full max-w-[1000px] items-center">
          <CallLayout />
        </div>

        <div
          className={cn("h-[calc(100vh-86px)] ml-2 transition-all duration-300", {
            "hidden": !showParticipants,
            "block": showParticipants,
          })}
        >
          <CallParticipantsList onClose={() => setShowParticipants(false)} />
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="fixed bottom-0 flex w-full items-center justify-center gap-5 flex-wrap">
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
                onClick={() => setLayout(item.toLowerCase() as CallLayoutType)}
              >
                {item}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Stats Button */}
        <CallStatsButton />

        {/* Copy Invite Link */}
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

        {/* End Call Button (hidden for personal rooms) */}
        {!isPersonalRoom && <EndCallButton />}
      </div>
    </section>
  );
};

export default MeetingRoom;
