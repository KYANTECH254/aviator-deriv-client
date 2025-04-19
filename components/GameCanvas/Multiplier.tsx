"use client";
import React, { useEffect, useRef } from "react";
import { useGameContext } from "@/context/GameContext";

const AnimateMultiplier: React.FC = () => {
    const { stage, fifthLayer, multiplier, flyAway } = useGameContext();
    // console.log("Multiplier", multiplier)
    // Refs for the multiplier text and animation frame ID.
    const multiplierTextRef = useRef<any>(null);
    const animationFrameIdRef = useRef<number>();

    // Refs to hold the latest multiplier and flyAway values.
    const latestMultiplierRef = useRef(multiplier);
    const latestFlyAwayRef = useRef(flyAway);

    // Update the multiplier ref whenever multiplier changes.
    useEffect(() => {
        latestMultiplierRef.current = multiplier;
    }, [multiplier]);

    // Update the flyAway ref whenever flyAway changes.
    useEffect(() => {
        latestFlyAwayRef.current = flyAway;
    }, [flyAway]);

    useEffect(() => {
        console.log("Stage:", stage, "FifthLayer:", fifthLayer);
        if (!stage || !fifthLayer) return;

        // Create the Konva.Text element if it does not exist.
        if (!multiplierTextRef.current) {
            const text = new window.Konva.Text({
                text: `${multiplier}x`,
                x: 0,
                y: stage.height() / 2,
                width: stage.width(),
                align: "center",
                fill: "#fff",
                fontSize: Math.max(20, stage.width() / 10),
                draggable: true,
            });
            multiplierTextRef.current = text;
            fifthLayer.add(text);
            fifthLayer.batchDraw();
        }

        // Animation loop to update the multiplier text.
        const animate = () => {
            // console.log("Animating multiplier text...");
            if (multiplierTextRef.current) {
                multiplierTextRef.current.text(`${latestMultiplierRef.current}x`);
            }
            fifthLayer.batchDraw();

            // If flyAway flag is "true", destroy the text; otherwise, continue the loop.
            if (latestFlyAwayRef.current === "true") {
                if (multiplierTextRef.current) {
                    multiplierTextRef.current.destroy();
                    multiplierTextRef.current = null;
                    fifthLayer.batchDraw();
                }
            } else {
                animationFrameIdRef.current = requestAnimationFrame(animate);
            }
        };

        animationFrameIdRef.current = requestAnimationFrame(animate);

        // Cleanup: cancel animation frame and destroy the text.
        return () => {
            if (animationFrameIdRef.current) {
                cancelAnimationFrame(animationFrameIdRef.current);
            }
            if (multiplierTextRef.current) {
                multiplierTextRef.current.destroy();
                multiplierTextRef.current = null;
                fifthLayer.batchDraw();
            }
        };
    }, [stage, fifthLayer]);

    return null;
};

export default AnimateMultiplier;
