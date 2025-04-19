"use client";

import { useGameContext } from "@/context/GameContext";
import React, { useEffect } from "react";

const GameStage: React.FC = () => {
    const { setStage, setLayers } = useGameContext();

    useEffect(() => {
        if (typeof window !== "undefined") {
            // Get the container dimensions from an element in the DOM.
            const canvasElement = document.getElementById("aviator-game-canvas");
            const width = canvasElement?.offsetWidth || 800;
            const height = canvasElement?.offsetHeight || 600;

            // Create the stage using window.Konva
            const stage = new window.Konva.Stage({
                container: "aviatorCanvas",
                width,
                height,
            });

            // Create your layers using window.Konva
            const baseLayer = new window.Konva.Layer();
            const backgroundLayer = new window.Konva.Layer();
            const thirdLayer = new window.Konva.Layer();
            const fourthLayer = new window.Konva.Layer();
            const fifthLayer = new window.Konva.Layer();

            // Add layers to the stage in the desired order.
            stage.add(baseLayer, backgroundLayer, thirdLayer, fourthLayer, fifthLayer);

            setStage(stage);
            
            // Update the Game Context with the created layers.
            setLayers({ baseLayer, backgroundLayer, thirdLayer, fourthLayer, fifthLayer });
        }
    }, [setLayers]);

    return (
        <>
            <div id="aviator-game-canvas" className="aviator-game-canva display-center">
                <div id="aviatorCanvas"></div>
            </div>
        </>
    );
};

export default GameStage;
