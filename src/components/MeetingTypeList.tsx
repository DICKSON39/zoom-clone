

import React, { useState } from "react";
import HomeCard from "./HomeCard";
import { useRouter } from "next/navigation";
import MeetingModal from "./MeetingModal";
import { useUser } from "@clerk/nextjs";
import { Call, useStreamVideoClient } from "@stream-io/video-react-sdk";
import { toast } from "sonner";
import { Textarea } from "./ui/textarea";
import ReactDatePicker from 'react-datepicker';
import { Input } from "./ui/input";

const MeetingTypeList = () => {
  const router = useRouter();
  const [meetingState, setMeetingState] = useState<
    "isScheduledMeeting" | "isJoiningMeeting" | "isInstantMeeting" | undefined
  >();

  const { user } = useUser();
  const client = useStreamVideoClient();
  const [values, setValues] = useState({
    dateTime: new Date(),
    description: "",
    link: "",
  });

  const [callDetails, setCallDetails] = useState<Call>();

  const createMeeting = async () => {
    if (!client || !user) return;

    try {
      if (!values.dateTime) {
        toast("please select the date and Time");
        return;
      }
      const id = crypto.randomUUID();
      const call = client.call("default", id);
      if (!call) throw new Error("Failed to create a new Call 😒😒");

      const startsAt =
        values.dateTime.toISOString() || new Date(Date.now()).toISOString();

      const description = values.description || "Instant Meeting";

      await call.getOrCreate({
        data: {
          starts_at: startsAt,
          custom: {
            description,
          },
        },
      });

      setCallDetails(call);

      if (!values.description) {
        router.push(`/meeting/${call.id}`);
      }
      toast("Event has been created.");
    } catch (error) {
      console.log(error);
      toast("Event has been created.");
    }
  };


  const meetingLink = `https://${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${callDetails?.id}`

  return (
    <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
      <HomeCard
        img="/icons/add-meeting.svg"
        title="New Meeting"
        description="Star An Instant Meeting"
        className="bg-[#0E78F9]"
        handleClick={() => setMeetingState("isInstantMeeting")}
      />
      <HomeCard
        img="/icons/join-meeting.svg"
        title="Join Meeting"
        description="via invitation link"
        className="bg-[#0E78F9]"
        handleClick={() => setMeetingState("isJoiningMeeting")}
      />

      <HomeCard
        img="/icons/schedule.svg"
        title="Schedule A meeting"
        description="plan your meeting"
        className="bg-[#830EF9]"
        handleClick={() => setMeetingState("isScheduledMeeting")}
      />

      <HomeCard
        img="/icons/recordings.svg"
        title="View Your Recordings"
        className="bg-[#F9A90E]"
        description="View Your Previous Meetings"
        handleClick={() => router.push("/recordings")}
      />

      {!callDetails ? (
        <MeetingModal
          isOpen={meetingState === "isScheduledMeeting"}
          onClose={() => setMeetingState(undefined)}
          title="Create A meeting later"
          handleClick={createMeeting}
        >
          <div className="flex flex-col gap-2.5">
            <label className="text-base text-normal leading-[22px] text-sky-2">
              Add Description
            </label>
            <Textarea
            className="border-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-[#252A41]" 
            onChange={(e)=> {
              setValues({...values,description: e.target.value})
            }}
            />
          </div>
          <div className="flex w-full flex-col gap-2.5">
            <label className="text-base text-normal leading-[22px] text-sky-2">
              Select Date & Time
            </label>
            <ReactDatePicker
            selected={values.dateTime}
            onChange={(date)=> setValues({...values,dateTime:date!})}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={15}
            timeCaption="time"
            dateFormat="MMMM d, yyyy h:mm aa"
            className="w-full rounded bg-[bg-[#252A41] p-2 focus:outline-none"
            />



          </div>
        </MeetingModal>
      ) : (
        <MeetingModal
          isOpen={meetingState === "isScheduledMeeting"}
          onClose={() => setMeetingState(undefined)}
          title="Meeting Created"
          handleClick={() => {
            navigator.clipboard.writeText(meetingLink);
            toast( 'Link Copied')
          }}
          image="/icons/checked.svg"
          buttonIcon="/icons/copy.svg"
          buttonText="Copy Meeting Link"
        />
      )}

      <MeetingModal
        isOpen={meetingState === "isInstantMeeting"}
        onClose={() => setMeetingState(undefined)}
        title="Start An Instant Meeting"
        className="text-center"
        buttonText="Start Meeting"
        handleClick={createMeeting}
      />

       <MeetingModal
        isOpen={meetingState === "isJoiningMeeting"}
        onClose={() => setMeetingState(undefined)}
        title="Join A meeting"
        className="text-center"
        buttonText="Join Meeting"
        handleClick={()=> router.push(values.link)}
      >
        <Input
        placeholder="meeting Link"
        className="border-none bg-[#252A41] focus-visible:ring-0 focus-visible:ring-offset-0"
        onChange={(e)=>setValues({...values,link:e.target.value}) }
        />



      </MeetingModal>



    </section>
  );
};

export default MeetingTypeList;
