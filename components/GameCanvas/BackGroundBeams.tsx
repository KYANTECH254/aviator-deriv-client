"use client";

import { useGameContext } from "@/context/GameContext";
import React, { useEffect, useRef } from "react";

export default function BackgroundBeams() {
  const { speed, backgroundLayer } = useGameContext();

  const beamsRef = useRef<any[]>([]);
  const rotationAngleRef = useRef(0);
  const animationFrameIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!backgroundLayer) return; 

    const height = backgroundLayer.height();
    const width = backgroundLayer.width();
    const totalBeams = 72;
    const beamLength = Math.sqrt(width ** 2 + height ** 2);
    const angleStep = (2 * Math.PI) / totalBeams;

    if (beamsRef.current.length === 0) {
      for (let i = 0; i < totalBeams; i++) {
        const beam = new window.Konva.Line({
          points: [0, height, 0, height, 0, height, 0, height],
          fill: i % 2 === 0 ? "#000000" : "#0c0c0c",
          closed: true,
        });
        backgroundLayer.add(beam);
        beamsRef.current.push(beam);
      }
    }

    const animate = () => {
      beamsRef.current.forEach((beam, i) => {
        const startAngle = rotationAngleRef.current + i * angleStep;
        const endAngle = startAngle + angleStep;
        beam.points([
          0, height,
          Math.cos(startAngle) * beamLength, height + Math.sin(startAngle) * beamLength,
          Math.cos(endAngle) * beamLength, height + Math.sin(endAngle) * beamLength,
          0, height,
        ]);
      });

      rotationAngleRef.current = (rotationAngleRef.current + speed) % (2 * Math.PI);
      backgroundLayer.batchDraw();
      animationFrameIdRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameIdRef.current !== null) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [backgroundLayer, speed]);

  return null;
}
