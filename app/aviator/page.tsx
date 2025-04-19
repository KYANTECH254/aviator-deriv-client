"use client"
import BackgroundBeams from "@/components/GameCanvas/BackGroundBeams";
import CombinedBackgroundAndEgg from "@/components/GameCanvas/CombinedBackgroundAndEgg";
import AnimateFlewAwayText from "@/components/GameCanvas/FlyAway";
import AnimateFlyingPlane from "@/components/GameCanvas/FlyingPlanewithTrail";
import LeftAndBottomBorder from "@/components/GameCanvas/LeftAndBottomCanvasBorder";
import Main from "@/components/GameCanvas/Main";
import AnimateMultiplier from "@/components/GameCanvas/Multiplier";
import SocketListener from "@/components/GameCanvas/SocketListener";
import AnimateWaitingForBets from "@/components/GameCanvas/WaitingForBets";
import { GameProvider } from "@/context/GameContext";
import { useEffect, useState } from "react";
import io from "socket.io-client";

export default function page() {

    const [socket, setSocket] = useState<any>(null);

    useEffect(() => {
        // Initialize your socket (update the URL as needed)
        const socketInstance = io('http://localhost:3000', {
            transports: ['websocket'],
            auth: { token: "" },
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
          });
        setSocket(socketInstance);

        // Clean up the socket connection when the component unmounts.
        return () => {
            socketInstance.disconnect();
        };
    }, []);

    // Only render the game when the socket is initialized.
    if (!socket) return <div>Loading...</div>;

    return (
        <div>
            <h1>Aviator</h1>
            <GameProvider>
                <SocketListener socket={socket} />
                <Main />
                <BackgroundBeams />
                {/* <LeftAndBottomBorder /> */}
                {/* <CombinedBackgroundAndEgg /> */}
                {/* <AnimateMultiplier /> */}
                {/* <AnimateFlewAwayText /> */}
                {/* <AnimateWaitingForBets /> */}
                <AnimateFlyingPlane />
            </GameProvider>
        </div>
    )
}