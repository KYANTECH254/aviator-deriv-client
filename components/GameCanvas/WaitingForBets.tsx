"use client";
import React, { useEffect, useState } from "react";
import { useGameContext } from "@/context/GameContext";
import LoaderGif from "./LoaderGif";
import PlaneGif from "./PlaneGif";

const AnimateWaitingForBets: React.FC = () => {
  const { stage, thirdLayer, fourthLayer } = useGameContext();
  const [deductheight, setDeductheight] = useState<number>(0);

  useEffect(() => {
    if (!stage || !thirdLayer || !fourthLayer) return;
    console.log(stage.height())
    // --- Loader Progress Setup ---
    const fullWidth = 150;
    const duration = 5000; // Duration in ms
    const loaderHeight = 7;
    const backgroundColor = "#21232a";
    const loaderYPosition = stage.height() * 0.8;
    const textYPosition = stage.height() * 0.6;
    let progressWidth = fullWidth;
    let startTime = performance.now();
    let animationFrameId: number;

    const heightbelow = stage.height();
    if (heightbelow > 400) {
      setDeductheight(105);
    } else if (heightbelow < 235) {
      setDeductheight(70);
    }

    // Create loader background rectangle.
    const loaderBg = new window.Konva.Rect({
      x: (stage.width() - fullWidth) / 2,
      y: loaderYPosition,
      width: fullWidth,
      height: loaderHeight,
      fill: backgroundColor,
      cornerRadius: 5,
    });

    // Create loader progress rectangle.
    const loaderProgress = new window.Konva.Rect({
      x: (stage.width() - fullWidth) / 2,
      y: loaderYPosition,
      width: progressWidth,
      height: loaderHeight,
      fill: "#c80432",
      cornerRadius: 5,
    });

    // Create waiting text.
    const waitingText = new window.Konva.Text({
      text: "WAITING FOR NEXT ROUND",
      x: 0,
      y: textYPosition,
      width: stage.width(),
      align: "center",
      fill: "#fff",
      fontSize: Math.max(20, stage.width() / 25),
      draggable: true,
    });

    // Add these elements to the fourth layer.
    fourthLayer.add(loaderBg, loaderProgress, waitingText);
    fourthLayer.batchDraw();

    // Animate the loader progress bar.
    const animateLoader = (timestamp: number) => {
      const elapsed = timestamp - startTime;
      progressWidth = Math.max(0, fullWidth - (fullWidth * (elapsed / duration)));
      loaderProgress.width(progressWidth);
      fourthLayer.batchDraw();

      if (elapsed < duration) {
        animationFrameId = requestAnimationFrame(animateLoader);
      } else {
        hideLoader();
      }
    };

    // Remove loader elements once animation completes.
    function hideLoader() {
      loaderBg.destroy();
      loaderProgress.destroy();
      waitingText.destroy();
      fourthLayer.batchDraw();
    }

    animationFrameId = requestAnimationFrame(animateLoader);

    // Cleanup on unmount.
    return () => {
      cancelAnimationFrame(animationFrameId);
      hideLoader();
    };
  }, [stage, thirdLayer, fourthLayer]);



  return (
    <>
      <LoaderGif layer={fourthLayer} />
      {stage && (
        <PlaneGif layer={thirdLayer} x={5} y={stage.height() - deductheight} />
      )}
    </>
  );
};

export default AnimateWaitingForBets;
