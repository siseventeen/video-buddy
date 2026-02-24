"use client";

import YouTube, { YouTubeEvent } from "react-youtube";
import { useAppContext } from "@/context/app-context";

export function VideoPlayer() {
  const { videoId, setPlayerInstance } = useAppContext();

  const onReady = (event: YouTubeEvent) => {
    setPlayerInstance(event.target);
  };

  if (!videoId) return null;

  return (
    <div className="w-full aspect-video rounded-lg overflow-hidden bg-black">
      <YouTube
        videoId={videoId}
        onReady={onReady}
        opts={{
          width: "100%",
          height: "100%",
          playerVars: {
            autoplay: 0,
            modestbranding: 1,
            rel: 0,
          },
        }}
        className="w-full h-full"
        iframeClassName="w-full h-full"
      />
    </div>
  );
}
