import React, { ReactNode } from "react";
import { StreamVideo, StreamVideoClient } from "@stream-io/video-react-sdk";
import { useUser } from "@clerk/nextjs";
import Loader from "@/components/Loader";
import { tokenProvider } from "../../../actions/stream.actions";


const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY!;

interface StreamVideoProviderProps {
  children: ReactNode;
}

const StreamVideoProvider: React.FC<StreamVideoProviderProps> = ({ children }) => {
  const { user, isLoaded } = useUser();
  const [videoClient, setVideoClient] = React.useState<StreamVideoClient>();

  React.useEffect(() => {
    if (!isLoaded || !user) return;

    const client = new StreamVideoClient({
      apiKey,
      user: {
        id: user.id,
        name: user.fullName || `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.id,
        image: user.imageUrl,
      },
      tokenProvider,
    });

    setVideoClient(client);

    return () => {
      client.disconnectUser();
      setVideoClient(undefined);
    };
  }, [user, isLoaded]);

  if (!videoClient) return <Loader />;

  return <StreamVideo client={videoClient}>{children}</StreamVideo>;
};

export default StreamVideoProvider;
