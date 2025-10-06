"use client";

import React from "react";
import Image from "next/image";
import { toast } from "sonner";

import { Button } from "./ui/button";
import { avatarImages } from "../../constants/index";

interface MeetingCardProps {
  title: string;
  date: string;
  icon: string;
  isPreviousMeeting?: boolean;
  buttonIcon1?: string;
  buttonText?: string;
  handleClick: () => void;
  link: string;
}

const MeetingCard = ({
  icon,
  title,
  date,
  isPreviousMeeting,
  buttonIcon1,
  handleClick,
  link,
  buttonText,
}: MeetingCardProps) => {
  return (
    <section className="flex w-full flex-col justify-between rounded-2xl bg-[#1C1F2E] p-6 transition hover:bg-[#22263A] xl:max-w-[580px]">
      {/* Header */}
      <div className="flex items-start justify-between">
        <Image src={icon} alt="icon" width={28} height={28} />
        {!isPreviousMeeting && (
          <div className="flex gap-2">
            <Button onClick={handleClick} className="bg-[#0E78F9] hover:bg-[#0C6FE3] px-4">
              {buttonIcon1 && (
                <Image src={buttonIcon1} alt="feature" width={18} height={18} />
              )}
              &nbsp; {buttonText}
            </Button>

            <Button
              onClick={() => {
                navigator.clipboard.writeText(link);
                toast.success("✅ Link copied to clipboard!");
              }}
              className="bg-[#1E2757] hover:bg-[#27316B] px-4"
            >
              <Image src="/icons/copy.svg" alt="copy" width={18} height={18} />
              &nbsp; Copy Link
            </Button>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mt-5 flex flex-col gap-1">
        <h1 className="text-xl font-semibold">{title}</h1>
        <p className="text-sm text-gray-400">{date}</p>
      </div>

      {/* Avatars */}
      <div className="mt-6 flex items-center">
        <div className="flex -space-x-4">
          {avatarImages.slice(0, 5).map((img, index) => (
            <Image
              key={index}
              src={img}
              alt="attendee"
              width={38}
              height={38}
              className="rounded-full border-2 border-[#1C1F2E]"
            />
          ))}
        </div>
        <div className="ml-3 text-sm font-medium text-gray-400">+5</div>
      </div>
    </section>
  );
};

export default MeetingCard;
