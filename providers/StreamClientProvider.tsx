"use client";

import { useUser } from "@clerk/nextjs";
import { StreamVideo, StreamVideoClient } from "@stream-io/video-react-sdk";
import { ReactNode, useEffect, useState } from "react";
import { tokenProvider } from "../actions/stream.actions";
import Loader from "@/components/Loader";

// 🛑 Import Stream Chat components
import { StreamChat,  } from "stream-chat";
import { Chat } from "stream-chat-react";

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;

const StreamClientProvider = ({ children }: { children: ReactNode }) => {
  // State for Stream Video
  const [videoClient, setVideoClient] = useState<StreamVideoClient>();
  
  // 1. State for Stream Chat
  const [chatClient, setChatClient] = useState<StreamChat>();

  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (!isLoaded || !user) return;
    if (!apiKey) throw new Error("Stream Api Key Missing");

    // --- Stream Video Client Initialization (Existing Logic) ---
    const videoClient = new StreamVideoClient({
      apiKey: apiKey,
      user: {
        id: user?.id,
        name:
          user?.fullName ||
          `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
          user?.username ||
          user?.primaryEmailAddress?.emailAddress ||
          user?.id,
        image: user?.imageUrl,
      },
      tokenProvider,
    });
    setVideoClient(videoClient);

    // -----------------------------------------------------------
    
    // 2. Stream Chat Client Initialization
    const chatClient = new StreamChat(apiKey);

    const connectChatUser = async () => {
        try {
            const token = await tokenProvider(); // Reusing the same token provider
            const chatUser = {
                id: user.id,
                name: user?.fullName || user.id,
                image: user?.imageUrl,
            };

            await chatClient.connectUser(
                chatUser,
                token
            );
            
            setChatClient(chatClient);
        } catch (error) {
            console.error("Error connecting Stream Chat user:", error);
        }
    }
    
    connectChatUser();

    // Cleanup function: disconnect the chat client when the component unmounts
    return () => {
        setVideoClient(undefined);
        if (chatClient) {
            chatClient.disconnectUser();
            setChatClient(undefined);
        }
    };

  }, [user, isLoaded]);

  // Handle Loading State for both clients
  if (!videoClient || !chatClient) return <Loader />;

  // 3. Wrap children with both providers
  return (
    <StreamVideo client={videoClient}>
      <Chat client={chatClient}>{children}</Chat>
    </StreamVideo>
  );
};

export default StreamClientProvider;