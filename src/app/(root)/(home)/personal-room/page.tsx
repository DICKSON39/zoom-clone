"use client";

import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import React from "react";
import { toast } from "sonner";
import { useGetCallById } from "../../../../../hooks/useGetCallById";
import { useStreamVideoClient } from "@stream-io/video-react-sdk";
import { useRouter } from "next/navigation";

const Table = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => (
  <div className="flex flex-col items-start gap-2 xl:flex-row">
    <h1 className="text-base font-medium text-sky-1 lg:text-xl xl:min-w-32">
      {title}:
    </h1>
    <h1 className="truncate text-sm font-bold max-sm:max-w-[320px] lg:text-xl">
      {description}
    </h1>
  </div>
);

const PersonalRoom = () => {
  const { user } = useUser();
  const meetingId = user?.id;
   const meetingLink = `https://${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${meetingId}?personal=true`
   const client = useStreamVideoClient();
   const router = useRouter();

   console.log('Meeting link:', meetingLink);


   const {call} =useGetCallById(meetingId!);

   const startRoom = async ()=> {

    if(!client || !user) return;

    

    if(!call) {
      const newCall = client.call('default', meetingId!)

      await newCall.getOrCreate({
        data: {
          starts_at: new Date().toISOString(),
        },
      });

    }
    router.push(`/meeting/${meetingId}?personal=true`)

    


   }
  return (
    <section className="flex size-full flex-col gap-10 text-white">
      <h1 className="text-3xl font-semibold"> Personal</h1>
      <div className="flex w-full flex-col gap-8 xl:max-w-[900px]">
        <Table title="Topic" description={`${user?.fullName}'s Meeting Room`} />
        <Table title="Meeting Id" description={meetingId!} />
        <Table title="Invite Link" description={meetingLink} />
      </div>
      <div className="flex gap-2">
        <Button className="bg-[#0E78F9]" onClick={startRoom}>
          Start Meeting

        </Button>

        <Button
  className="bg-[#252A41]"
  disabled={!call}
  onClick={() => {
    navigator.clipboard.writeText(meetingLink);
    toast('Link Copied');
  }}
>
  Copy Invitation
</Button>


      </div>
    </section>
  );
};

export default PersonalRoom;
