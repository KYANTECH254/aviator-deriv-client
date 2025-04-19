"use client";
import { useGameContext } from "@/context/GameContext";
import React, { useEffect } from "react";

const LeftAndBottomBorder: React.FC = () => {
  // Retrieve the backgroundLayer from the Game Context.
  const { backgroundLayer } = useGameContext();

  useEffect(() => {
    if (!backgroundLayer) return; // Wait until the layer is available

    const stage = backgroundLayer.getStage();
    if (!stage) return;

    // Calculate strokeWidth dynamically based on the stage width.
    const stageWidth = stage.width();
    const strokeWidth = stageWidth < 700 ? 1 : 0.1;

    // Configuration values.
    const dotRadius = 2;
    let dotPositionY = 0;
    const dotSpacingY = 40;
    const borderOffset = 30;
    const dotSpeed = 0.5;
    const disappearOffsetY = 30;
    const dotSpacingX = 100;
    const xAxisOffset = 30;

    // We'll store the horizontal dot positions here.
    let whiteDotPositions: number[] = [];

    // Helpers to always get the current layer dimensions.
    const getWidth = () => backgroundLayer.width();
    const getHeight = () => backgroundLayer.height();

    // Initialize horizontal dot positions based on the current width.
    function initWhiteDots() {
      whiteDotPositions = [];
      const currentWidth = getWidth();
      const count = Math.ceil(currentWidth / dotSpacingX) + 1;
      for (let i = 0; i < count; i++) {
        whiteDotPositions.push(currentWidth - i * dotSpacingX);
      }
    }

    // Draw the static left and bottom borders.
    function drawBorders() {
      // Remove previous border lines (if any) using a name.
      backgroundLayer.find(".border-line").forEach((node: any) => node.destroy());

      const currentWidth = getWidth();
      const currentHeight = getHeight();

      const leftBorder = new window.Konva.Line({
        points: [borderOffset, 0, borderOffset, currentHeight - borderOffset],
        stroke: "white",
        strokeWidth: strokeWidth,
        name: "border-line",
      });

      const bottomBorder = new window.Konva.Line({
        points: [borderOffset, currentHeight - borderOffset, currentWidth, currentHeight - borderOffset],
        stroke: "white",
        strokeWidth: strokeWidth,
        name: "border-line",
      });

      console.log("Border width", strokeWidth);
      backgroundLayer.add(leftBorder);
      backgroundLayer.add(bottomBorder);
      backgroundLayer.draw();
    }

    // Draw moving vertical dots along the left border.
    function drawDotsY() {
      // Remove previously drawn vertical dots.
      backgroundLayer.find(".vertical-dot").forEach((node: any) => node.destroy());
      const currentHeight = getHeight();

      for (let i = dotPositionY; i < currentHeight - disappearOffsetY; i += dotSpacingY) {
        const dot = new window.Konva.Circle({
          x: borderOffset - 15,
          y: i,
          radius: dotRadius,
          fill: "rgb(8, 180, 228)",
          name: "vertical-dot",
        });
        backgroundLayer.add(dot);
      }

      dotPositionY += dotSpeed;
      if (dotPositionY >= dotSpacingY) {
        dotPositionY = 0;
      }
    }

    // Draw moving horizontal dots along the bottom border.
    function drawDotsX() {
      backgroundLayer.find(".horizontal-dot").forEach((node: any) => node.destroy());
      const currentWidth = getWidth();
      const currentHeight = getHeight();

      for (let i = 0; i < whiteDotPositions.length; i++) {
        const posX = whiteDotPositions[i];
        if (posX > xAxisOffset) {
          const dot = new window.Konva.Circle({
            x: posX,
            y: currentHeight - borderOffset + 15,
            radius: dotRadius,
            fill: "white",
            name: "horizontal-dot",
          });
          backgroundLayer.add(dot);
        }
        // Update the dot position for animation.
        whiteDotPositions[i] -= dotSpeed;
        if (whiteDotPositions[i] <= xAxisOffset) {
          const maxPosX = Math.max(...whiteDotPositions);
          whiteDotPositions[i] = maxPosX + dotSpacingX;
        }
      }
    }

    let animationId: number;
    // The main animation loop.
    function animate() {
      drawDotsY();
      drawDotsX();
      backgroundLayer.batchDraw();
      animationId = requestAnimationFrame(animate);
    }

    // Initialize the dots and borders before starting.
    initWhiteDots();
    drawBorders();
    animate();

    // Resize handler: when the window resizes, clear and reinitialize the drawing.
    function handleResize() {
      // Clear all children from the layer.
      backgroundLayer.destroyChildren();
      // Reinitialize the dots based on the new width.
      initWhiteDots();
      // Redraw the static borders.
      drawBorders();
    }

    window.addEventListener("resize", handleResize);

    // Cleanup on unmount.
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
    };
  }, [backgroundLayer]);

  return null;
};

export default LeftAndBottomBorder;
