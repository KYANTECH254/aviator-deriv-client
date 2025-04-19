"use client";
import React, { useEffect } from "react";

interface PlaneGifProps {
  layer: any;
  x: number;
  y: number;
}

const PlaneGif: React.FC<PlaneGifProps> = ({ layer, x, y }) => {
  useEffect(() => {
    if (!layer) return;

    // Create an offscreen canvas for the GIF animation.
    const canvas = document.createElement("canvas");
    canvas.className = "aviatorCanvas";

    // Callback to draw each frame of the GIF.
    function onDrawFrame(ctx: any, frame: any) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(frame.buffer, frame.x, frame.y);
      layer.draw(); // Redraw the layer containing the plane.
    }

    // Start the GIF animation using gifler.
    window.gifler("assets/images/plane.gif").frames(canvas, onDrawFrame, true);

    // Compute initial dimensions dynamically from the stage width.
    const stageWidth = layer.getStage().width();
    // Use 15% of the stage width (with a maximum of 200px) for the plane's width.
    let planeWidth = Math.min(stageWidth * 0.25, 200);
    // Maintain the 2:1 aspect ratio (width:height = 2:1).
    let planeHeight = planeWidth * 0.5;

    // Normalize the X position as a percentage of stage width.
    const xPercentage = x / stageWidth;

    // Create the Konva.Image for the plane.
    const planeImage = new window.Konva.Image({
      image: canvas,
      width: planeWidth,
      height: planeHeight,
      x: x,
      y: y,
      visible: true,
      draggable: true,
    });

    // Add the image to the layer and adjust its position.
    layer.add(planeImage);
    planeImage.position({ x: Math.max(0, x), y: Math.max(0, y) });
    layer.batchDraw();

    // Update the plane size and position on window resize.
    function updatePlaneSize() {
      const newStageWidth = layer.getStage().width();

      // Recalculate the dimensions based on the new stage width.
      planeWidth = Math.min(newStageWidth * 0.25, 200);
      planeHeight = planeWidth * 0.5;

      // Update the plane's dimensions.
      planeImage.width(planeWidth);
      planeImage.height(planeHeight);

      // Update the X position based on the normalized percentage.
      planeImage.x(newStageWidth * xPercentage);

      layer.batchDraw();
    }

    // Listen for window resize events.
    window.addEventListener("resize", updatePlaneSize);

    // Cleanup on unmount.
    return () => {
      window.removeEventListener("resize", updatePlaneSize);
      planeImage.destroy();
      layer.batchDraw();
    };
  }, [layer, x, y]);

  return null;
};

export default PlaneGif;
