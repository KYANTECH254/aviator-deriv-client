"use client";
import React, { useEffect, useState, useRef } from "react";
import { useGameContext } from "@/context/GameContext";
import PlaneGif from "./PlaneGif";

const AnimateFlyingPlane: React.FC = () => {
  const { stage, fourthLayer, flyAway } = useGameContext();

  // State for the plane's position (passed to PlaneGif).
  const [planePos, setPlanePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Refs for dynamic values.
  const velocityRef = useRef<number>(1);
  const posRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const trailPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const floatOffsetRef = useRef<number>(0.05);
  const floatAmplitudeRef = useRef<number>(60);
  const floatSpeed = 0.025; // constant

  // Refs for flags.
  const hasEngineStartedRef = useRef<boolean>(false);
  const hasFlownAwayRef = useRef<boolean>(false);
  const eventRef = useRef<boolean>(true);
  const flyAwayFlagRef = useRef<string>(flyAway);
  useEffect(() => {
    flyAwayFlagRef.current = flyAway;
  }, [flyAway]);

  // Audio objects.
  const engineStartAudioRef = useRef(new Audio("/assets/audio/aviatortakeoff.mp3"));
  const flyAwayAudioRef = useRef(new Audio("/assets/audio/aviatorflewaway.mp3"));

  // Ref for the animation frame ID.
  const animFrameIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!stage || !fourthLayer) return;

    // Get dimensions from the fourthLayer.
    const canvasWidth = fourthLayer.width();
    const canvasHeight = fourthLayer.height();
    const runwayEnd = canvasWidth * 0.12;
    let floatEnd: number;
    let fixedHeight: number;
    let fixedEndHeight: number;

    console.log(`My canvas width is ${canvasWidth}px...`);

    // Determine runway and floating parameters.
    if (canvasWidth < 412) {
      floatEnd = canvasWidth * 0.75;
      fixedHeight = 60;
      fixedEndHeight = 55;
      velocityRef.current = 1;
    } else if (canvasWidth > 1080) {
      floatEnd = canvasWidth * 0.8;
      fixedHeight = 80;
      fixedEndHeight = 70;
    } else if (canvasWidth >= 1024 && canvasWidth <= 1080) {
      floatEnd = canvasWidth * 0.8;
      fixedHeight = 60;
      fixedEndHeight = 55;
    } else if (canvasWidth >= 412 && canvasWidth < 740) {
      floatEnd = canvasWidth * 0.8;
      fixedHeight = 60;
      fixedEndHeight = 55;
    } else if (canvasWidth >= 740 && canvasWidth <= 1024) {
      floatEnd = canvasWidth * 0.8;
      fixedHeight = 70;
      fixedEndHeight = 60;
    } else {
      floatEnd = canvasWidth * 0.8;
      fixedHeight = 60;
      fixedEndHeight = 55;
    }

    // Determine float amplitude based on canvas height.
    if (canvasHeight > 400) {
      floatAmplitudeRef.current = Math.floor(Math.random() * (90 - 60 + 1)) + 60;
    } else if (canvasHeight < 235) {
      floatAmplitudeRef.current = Math.floor(Math.random() * (60 - 40 + 1)) + 40;
    } else {
      floatAmplitudeRef.current = 60;
    }

    // Fixed constants.
    const fixedWidth = 160;
    const fixedXPosition = -15;
    const fixedYPosition = 105;

    // Calculate new plane dimensions.
    const planeWidth = Math.max(80, canvasWidth / 7.5);
    const planeHeight = planeWidth / 2;

    // Calculate scaling ratios.
    const widthRatio = planeWidth / fixedWidth;
    const heightRatio = planeHeight / fixedHeight;

    // Calculate initial positions.
    const initX = fixedXPosition * widthRatio;
    const initY = stage.height() - fixedYPosition * heightRatio;
    const tHeight = canvasHeight * 0.4 - fixedEndHeight * heightRatio;
    const targetHeight = canvasHeight * 0.4;

    // Set initial positions.
    posRef.current = { x: initX, y: initY };
    trailPosRef.current = { x: initX, y: initY };
    setPlanePos({ x: initX, y: initY });

    // Create trail elements.
    const trailLine = new window.Konva.Path({
      data: "",
      stroke: "#d40034",
      strokeWidth: 5,
      lineCap: "round",
      lineJoin: "round",
    });
    fourthLayer.add(trailLine);
    const trailFill = new window.Konva.Path({
      data: "",
      stroke: "transparent",
      strokeWidth: 1,
      fill: "#d60c3e7c",
      closed: true,
    });
    fourthLayer.add(trailFill);

    // Helper function to update trail paths.
    const updateTrails = (x: number, y: number) => {
      let linePath = `M30,${canvasHeight - 33} `;
      let fillPath = `M30,${canvasHeight - 35} `;
      if (x <= runwayEnd) {
        linePath += `L${x},${canvasHeight - 35} `;
        fillPath += `L${x},${canvasHeight - 35} `;
      } else {
        const controlX = runwayEnd + (x - runwayEnd) / 2;
        const controlY = canvasHeight - 35;
        linePath += `Q${controlX},${controlY} ${x},${y} `;
        fillPath += `Q${controlX},${controlY} ${x},${y} `;
      }
      fillPath += `L${x},${canvasHeight - 30} L30,${canvasHeight - 30} Z`;
      trailLine.data(linePath);
      trailFill.data(fillPath);
      fourthLayer.batchDraw();
    };

    // Animation loop.
    const animatePlane = () => {
      let newX = posRef.current.x;
      let newY = posRef.current.y;
      let newTrailX = trailPosRef.current.x;
      let newTrailY = trailPosRef.current.y;

      if (flyAwayFlagRef.current === "true") {
        if (!hasFlownAwayRef.current) {
          engineStartAudioRef.current.pause();
          flyAwayAudioRef.current.play();
          hasFlownAwayRef.current = true;
        }
        // Increase speed when flying away.
        velocityRef.current = 10;
        newX += velocityRef.current;
        if (newX > canvasWidth) {
          // Reset positions for a new round.
          newX = initX;
          newTrailX = initX;
          posRef.current = { x: initX, y: initY };
          trailPosRef.current = { x: initX, y: initY };
          setPlanePos({ x: initX, y: initY });
          updateTrails(newTrailX, initY);
          fourthLayer.batchDraw();
          hasFlownAwayRef.current = false;
          // Continue the loop with the reset position.
          animFrameIdRef.current = requestAnimationFrame(animatePlane);
          return;
        }
      } else if (flyAwayFlagRef.current === "false") {
        if (!hasEngineStartedRef.current && eventRef.current && newX <= 10) {
          engineStartAudioRef.current.play();
          hasEngineStartedRef.current = true;
        }
        newX += velocityRef.current;
        newTrailX += velocityRef.current;
        if (newX <= runwayEnd) {
          newY = initY;
          newTrailY = canvasHeight - 35;
        } else if (newX <= floatEnd) {
          const trailProgress = (newTrailX - runwayEnd) / (floatEnd - runwayEnd);
          const progress = (newX - runwayEnd) / (floatEnd - runwayEnd);
          newY = initY - progress * (initY - tHeight);
          newTrailY = canvasHeight - 35 - trailProgress * (canvasHeight - 35 - targetHeight);
        } else {
          newX = floatEnd;
          newTrailX = floatEnd - initX;
          newY = tHeight + Math.sin(floatOffsetRef.current) * floatAmplitudeRef.current;
          newTrailY = targetHeight + Math.sin(floatOffsetRef.current) * floatAmplitudeRef.current;
          floatOffsetRef.current += floatSpeed;
        }
      }

      // Update refs and state.
      posRef.current = { x: newX, y: newY };
      trailPosRef.current = { x: newTrailX, y: newTrailY };
      setPlanePos({ x: newX, y: newY });
      updateTrails(newTrailX, newTrailY);
      animFrameIdRef.current = requestAnimationFrame(animatePlane);
    };

    animFrameIdRef.current = requestAnimationFrame(animatePlane);

    // Cleanup: cancel animation frame and destroy trail objects.
    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      engineStartAudioRef.current.pause();
      flyAwayAudioRef.current.pause();
      setPlanePos({ x: 0, y: 0 });
      trailLine.destroy();
      trailFill.destroy();
      fourthLayer.batchDraw();
    };
  }, [stage, fourthLayer, flyAway]);

  return (
    <>
      {stage && fourthLayer && <PlaneGif layer={fourthLayer} x={planePos.x} y={planePos.y} />}
    </>
  );
};

export default AnimateFlyingPlane;
