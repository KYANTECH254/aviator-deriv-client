"use client";
import { useEffect } from "react";
import { useGameContext } from "@/context/GameContext";

interface SocketListenerProps {
  socket: any; // Replace with your socket type if available
}

const SocketListener: React.FC<SocketListenerProps> = ({ socket }) => {
  const { setMultiplier, setMaxMultiplier, setFlyAway } = useGameContext();

  useEffect(() => {
    // Listener for incoming multiplier updates.
    const handleMultiplier = (data: any) => {
      if (!data) return;
      // Update multiplier in the context.
      setMultiplier(data.multiplier);
    };

    // Listener for incoming maxMultiplier updates.
    const handleMaxMultiplier = (data: any) => {
      if (!data) return;
      // Update maxMultiplier in the context.
      setMaxMultiplier(data.value);
    };

    // Listener for crash events (fly-away flag).
    const handleCrashed = (data: any) => {
      if (!data) return;
      // Update flyAway in the context.
      setFlyAway(data.crashed);
    };

    // Attach listeners to the socket.
    socket.on("multiplier", handleMultiplier);
    socket.on("maxMultiplier", handleMaxMultiplier);
    socket.on("crashed", handleCrashed);
    socket.on("error", (data: any) => {
      console.error(`Socket error: ${data}`);
    });

    // Cleanup: remove listeners when the component unmounts.
    return () => {
      socket.off("multiplier", handleMultiplier);
      socket.off("maxMultiplier", handleMaxMultiplier);
      socket.off("crashed", handleCrashed);
      socket.off("error");
    };
  }, [socket, setMultiplier, setMaxMultiplier, setFlyAway]);

  return null; // This component does not render anything.
};

export default SocketListener;
