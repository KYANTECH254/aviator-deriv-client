"use client";
import React, { useEffect, useRef } from "react";
import { useGameContext } from "@/context/GameContext";

const AnimateFlewAwayText: React.FC = () => {
  const { stage, fifthLayer, maxMultiplier } = useGameContext();
  
  // Refs to hold the created Konva.Text objects and animation frame ID.
  const flewAwayTextRef = useRef<any>(null);
  const multiplierTextRef = useRef<any>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!stage || !fifthLayer) return;

    const displayTime = 2000; // Duration to display the texts (in ms)
    let startTime: number | null = null;

    const stringMaxMultipier = maxMultiplier.toFixed(2);

    // Create the "FLEW AWAY!" text.
    const flewAwayText = new window.Konva.Text({
      text: "FLEW AWAY!",
      x: 0, // Centered horizontally via width/align
      y: stage.height() * 0.25, // Positioned at 25% of stage height
      width: stage.width(),
      align: "center",
      fill: "#fff",
      fontSize: Math.max(20, stage.width() * 0.03),
      draggable: true,
    });

    // Create the multiplier text using maxMultiplier from context.
    const multiplierText = new window.Konva.Text({
      text: `${stringMaxMultipier}x`,
      x: 0, // Centered horizontally
      y: stage.height() / 2, // Positioned at the middle of the stage
      width: stage.width(),
      align: "center",
      fill: "#d0021b",
      fontSize: Math.max(20, stage.width() * 0.10),
      draggable: true,
    });

    // Save references.
    flewAwayTextRef.current = flewAwayText;
    multiplierTextRef.current = multiplierText;

    // Add texts to the fifth layer and draw them.
    fifthLayer.add(flewAwayText);
    fifthLayer.add(multiplierText);
    fifthLayer.batchDraw();

    // Animation function that runs until displayTime is reached.
    const drawText = (timestamp: number) => {
      if (startTime === null) {
        startTime = timestamp;
      }
      const elapsed = timestamp - startTime;

      // (Optional: additional animation logic such as fading could be added here.)

      if (elapsed < displayTime) {
        animationFrameIdRef.current = requestAnimationFrame(drawText);
      } else {
        // Hide the texts after displayTime has elapsed.
        if (flewAwayTextRef.current) {
          flewAwayTextRef.current.hide();
        }
        if (multiplierTextRef.current) {
          multiplierTextRef.current.hide();
        }
        fifthLayer.batchDraw();
      }
    };

    // Start the animation loop.
    animationFrameIdRef.current = requestAnimationFrame(drawText);

    // Cleanup function: cancel animation and destroy texts.
    return () => {
      if (animationFrameIdRef.current !== null) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      if (flewAwayTextRef.current) {
        flewAwayTextRef.current.destroy();
        flewAwayTextRef.current = null;
      }
      if (multiplierTextRef.current) {
        multiplierTextRef.current.destroy();
        multiplierTextRef.current = null;
      }
      fifthLayer.batchDraw();
    };
  }, [stage, fifthLayer, maxMultiplier]);

  return null;
};

export default AnimateFlewAwayText;
