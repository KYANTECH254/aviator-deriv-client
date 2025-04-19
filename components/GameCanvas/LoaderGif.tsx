"use client";
import React, { useEffect } from "react";

interface LoaderGifProps {
  layer: any; // Ideally, use the proper Konva.Layer type if available.
}

const LoaderGif: React.FC<LoaderGifProps> = ({ layer }) => {
  useEffect(() => {
    if (!layer) return;

    // Create an offscreen canvas for the GIF animation.
    const canvas = document.createElement("canvas");
    canvas.className = "aviatorCanvas";

    // Callback function to draw each frame of the GIF.
    function onDrawFrame(ctx: any, frame: any) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(frame.buffer, frame.x, frame.y);
      layer.draw(); // Redraw the layer with the updated GIF frame.
    }

    // Start animating the loader GIF using gifler.
    window.gifler("assets/images/loader.gif").frames(canvas, onDrawFrame, true);

    // Initial dimensions for the loader.
    let loaderWidth = 100;
    let loaderHeight = 100;

    // Create a Konva.Image from the canvas for the loader.
    const loaderImage = new window.Konva.Image({
      image: canvas,
      width: loaderWidth,
      height: loaderHeight,
      x: (layer.width() - loaderWidth) / 2, // Center horizontally.
      y: layer.height() * 0.1, // Fixed Y position (10% of layer height).
      visible: true,
      draggable: true,
    });

    layer.add(loaderImage);
    layer.batchDraw();

    // Function to update loader image on window resize.
    function updateLoaderImage() {
      const stageWidth = layer.getStage().width();

      // Adjust loader width dynamically: 10% of stage width, capped at 150px.
      loaderWidth = Math.min(stageWidth * 0.1, 150);
      loaderHeight = loaderWidth; // Keep the loader square.

      // Update the loader's size and re-center it.
      loaderImage.width(loaderWidth);
      loaderImage.height(loaderHeight);
      loaderImage.x((stageWidth - loaderWidth) / 2);

      layer.batchDraw();
    }

    // Listen for window resize events.
    window.addEventListener("resize", updateLoaderImage);

    // Cleanup on component unmount.
    return () => {
      window.removeEventListener("resize", updateLoaderImage);
      loaderImage.destroy();
      layer.batchDraw();
    };
  }, [layer]);

  return null;
};

export default LoaderGif;
