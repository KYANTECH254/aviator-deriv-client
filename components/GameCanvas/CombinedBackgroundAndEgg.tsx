"use client";
import React, { useEffect, useRef } from "react";
import { useGameContext } from "@/context/GameContext";

/**
 * Draws a centered egg shape onto the provided layer and stage using the given gradient colors.
 */
function drawCenteredEggShape(
  layer: any,
  stage: any,
  colors: { center: string; edge: string; fade: string }
): void {
  const canvasWidth = stage.width();
  const canvasHeight = stage.height();
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;

  const reflectionOval = new window.Konva.Shape({
    sceneFunc: (context: any, shape: any) => {
      context.save();

      // Define oval dimensions extending beyond the canvas.
      const ovalWidth = canvasWidth + 200;
      const ovalHeight = canvasHeight * 1.2;

      // Create a radial gradient for the reflection effect.
      const gradient = context.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        Math.max(ovalWidth / 2, ovalHeight / 2)
      );
      gradient.addColorStop(0, colors.center);   // Strong center
      gradient.addColorStop(0.4, colors.edge);     // Fading edge
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');  // Fully transparent

      context.fillStyle = gradient;
      context.beginPath();
      context.ellipse(centerX, centerY, ovalWidth / 2, ovalHeight / 2, 0, 0, Math.PI * 2);
      context.fill();

      // Create a vertical fade mask at the top and bottom.
      const fadeGradient = context.createLinearGradient(
        0,
        centerY - ovalHeight / 2 - 100,
        0,
        centerY + ovalHeight / 2 + 100
      );
      fadeGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
      fadeGradient.addColorStop(0.4, colors.fade);
      fadeGradient.addColorStop(0.6, colors.fade);
      fadeGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      context.globalCompositeOperation = 'source-atop';
      context.fillStyle = fadeGradient;
      context.fillRect(0, 0, canvasWidth, canvasHeight);

      context.restore();
      context.fillStrokeShape(shape);
    }
  });

  layer.add(reflectionOval);
  layer.draw();
}

/**
 * Based on the desired size, clears the provided layer and draws the corresponding background.
 */
function AnimateFlyingPlaneBackground(
  size: 'small' | 'medium' | 'large' | 'none',
  layer: any,
  stage: any
): void {
  // Remove any existing drawings from the layer.
  function removeDrawing(): void {
    layer.destroyChildren();
    layer.draw();
  }
  // Each size calls drawCenteredEggShape with a different color scheme.
  function drawSmall(): void {
    drawCenteredEggShape(layer, stage, {
      center: 'rgba(35, 100, 137, 0.8)',  // Blue center
      edge: 'rgba(35, 100, 137, 0.15)',    // Lighter blue edge
      fade: 'rgba(0, 0, 0, 0.2)'           // Light fade
    });
  }
  function drawMedium(): void {
    drawCenteredEggShape(layer, stage, {
      center: 'rgba(140, 40, 220, 0.8)',   // Purple center
      edge: 'rgba(140, 40, 220, 0.15)',    // Fading purple edge
      fade: 'rgba(0, 0, 0, 0.3)'           // Purple fade effect
    });
  }
  function drawLarge(): void {
    drawCenteredEggShape(layer, stage, {
      center: 'rgba(255, 105, 180, 0.8)',  // Pink center
      edge: 'rgba(255, 105, 180, 0.15)',   // Lighter pink edge
      fade: 'rgba(0, 0, 0, 0.3)'           // Soft pink fade
    });
  }

  // Select drawing based on the provided size.
  switch (size) {
    case 'none':
      removeDrawing();
      break;
    case 'small':
      removeDrawing();
      drawSmall();
      break;
    case 'medium':
      removeDrawing();
      drawMedium();
      break;
    case 'large':
      removeDrawing();
      drawLarge();
      break;
    default:
      console.error('Invalid size parameter. Use "small", "medium", "large", or "none".');
      break;
  }
}

/**
 * CombinedBackgroundAndEgg component reads values from the Game Context
 * (thirdLayer, stage, multiplier, flyAway) and determines the appropriate
 * background to display. It then calls AnimateFlyingPlaneBackground to update
 * the drawing on the Konva layer.
 */
const CombinedBackgroundAndEgg: React.FC = () => {
  const { thirdLayer, stage, multiplier, flyAway } = useGameContext();
  const currentBackgroundSizeRef = useRef<'small' | 'medium' | 'large' | 'none'>("none");

  useEffect(() => {
    if (!thirdLayer || !stage) return;
    // If the multiplier is less than 1, do not draw a background.
    if (multiplier < 1) return;

    // Determine new background size based on multiplier.
    let newBackgroundSize: 'small' | 'medium' | 'large' | 'none';
    if (multiplier < 2) {
      newBackgroundSize = 'small';
    } else if (multiplier < 10) {
      newBackgroundSize = 'medium';
    } else {
      newBackgroundSize = 'large';
    }
    // Override to "none" if the fly-away flag is true.
    if (flyAway === "true") {
      newBackgroundSize = 'none';
    }

    // Only update the drawing if the background size has changed.
    if (newBackgroundSize !== currentBackgroundSizeRef.current) {
      AnimateFlyingPlaneBackground(newBackgroundSize, thirdLayer, stage);
      currentBackgroundSizeRef.current = newBackgroundSize;
    }
  }, [thirdLayer, stage, multiplier, flyAway]);

  return null;
};

export default CombinedBackgroundAndEgg;
