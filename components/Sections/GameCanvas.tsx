"use client";
import useSettings from "@/hooks/useSettings";
import useUserInteraction from "@/hooks/useUserInteraction";
import { useEffect, useRef, useState } from "react";


export default function GameCanvas({ socket }: any) {
    const layerRef = useRef<any>(null);
    const [multiplier, setMultiplier] = useState("1.00")
    const [maxMultiplier, setmaxMultiplier] = useState("1.00")
    const [isflyAway, setIsFlyAway] = useState<string>("false")
    const { isMusicEnabled, setIsMusicEnabled, isAnimationEnabled, setIsAnimationEnabled } = useSettings()
    const { eventTriggered } = useUserInteraction()

    const multiplierRef = useRef(multiplier);
    const maxMultiplierRef = useRef(maxMultiplier)
    const isMusicPlayingRef = useRef(isMusicEnabled);
    const flyAwayRef = useRef(isflyAway)
    const musicRef = useRef(isMusicEnabled)
    const eventRef = useRef(eventTriggered)
    const animationRef = useRef(isAnimationEnabled)
    const position = useRef({ x: 0, y: 0 });
    const trailposition = useRef({ x: 0, y: 0 });
    const velocity = useRef<number>(2);

    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth !== windowWidth) {
                setWindowWidth(window.innerWidth);
                window.location.reload();
            }
        };

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, [windowWidth]);

    useEffect(() => {
        // Listener for incoming messages
        const handleMultiplier = (data: any) => {
            if (data.length === 0) return;
            setMultiplier(data.multiplier)
        };

        const handlemaxMultiplier = (data: any) => {
            if (data.length === 0) return;
            setmaxMultiplier(data.value)
        };

        const handleCrashed = (data: any) => {
            if (data.length === 0) return;
            setIsFlyAway(data.crashed)
        };

        // Attach listeners
        socket.on("multiplier", handleMultiplier);
        socket.on("maxMultiplier", handlemaxMultiplier);
        socket.on("crashed", handleCrashed);

        socket.on("error", (data: any) => {
            console.log(`Error ${data}`);
        });

        // Cleanup on unmount or dependency change
        return () => {
            socket.off("multiplier", handleMultiplier);
            socket.off("crashed", handleCrashed);
            socket.off("error");
        };
    }, [socket]);

    useEffect(() => {
        multiplierRef.current = multiplier;
        maxMultiplierRef.current = maxMultiplier;
        isMusicPlayingRef.current = isMusicEnabled;
        flyAwayRef.current = isflyAway;
        musicRef.current = isMusicEnabled;
        animationRef.current = isAnimationEnabled;
        eventRef.current = eventTriggered;
    }, [isMusicEnabled, isflyAway, isMusicEnabled, isAnimationEnabled, eventTriggered, multiplier, maxMultiplier])

    useEffect(() => {
        // console.log("Animation:", animationRef.current, "Fly away:", flyAwayRef.current, "Multiplier:", multiplierRef.current);
        if (typeof window !== "undefined") {
            let animationId: number;

            // Create a stage
            const canvasElement = document.getElementById('aviator-game-canvas');
            const width = canvasElement?.offsetWidth || 0;
            const height = canvasElement?.offsetHeight || 0;

            const stage = new window.Konva.Stage({
                container: 'aviatorCanvas',
                width: width,
                height: height,
            });

            // Create layers
            const baseLayer = new window.Konva.Layer();
            const backgroundLayer = new window.Konva.Layer();
            const thirdLayer = new window.Konva.Layer();
            const fourthLayer = new window.Konva.Layer();
            const fifthLayer = new window.Konva.Layer();
            stage.add(baseLayer, backgroundLayer, thirdLayer, fourthLayer, fifthLayer);

            // Clean up layers and animation
            const cleanup = () => {
                if (animationId) cancelAnimationFrame(animationId);
                thirdLayer.clear();
                fourthLayer.clear();
                fifthLayer.clear();
                baseLayer.clearCache();
                backgroundLayer.clearCache();
                thirdLayer.clearCache();
                fourthLayer.clearCache();
                fifthLayer.clearCache();
                stage.clearCache();
                thirdLayer.destroy();
                fourthLayer.destroy();
                fifthLayer.destroy();
                stage.destroy();
            };

            // Function to trigger static animations once
            const startStaticAnimationsTrue = () => {
                drawRotatingBeams(0.003, backgroundLayer);
                // AnimateLeftAndBottomCanvasBorder(thirdLayer, stage);
            };

            const startStaticAnimationsFalse = () => {
                drawRotatingBeams(0.00, backgroundLayer)
               
            };

            // Function to start the animation loop
            const startAnimation = () => {
                if (flyAwayRef.current === "true") {
                    drawAnimatedBackground(thirdLayer, stage)
                    // Show "flew away" text immediately
                    AnimateFlewAwayText(maxMultiplierRef.current, thirdLayer, stage);

                    // After 2 seconds, show waiting for bets for 5 seconds
                    setTimeout(() => {
                        if (flyAwayRef.current === "true") {
                            // Show waiting for bets text
                            AnimateWaitingForBets(thirdLayer, stage, thirdLayer);

                            // After 5 seconds, restart everything
                            setTimeout(() => {
                                flyAwayRef.current = "false";
                            }, 5000);
                        }
                    }, 2000);
                    return;
                }
                else if (flyAwayRef.current === "false") {
                    drawAnimatedBackground(thirdLayer, stage)
                }

                // Loop the animation
                animationId = requestAnimationFrame(startAnimation);
            };

            // Only redraw static animations once
            if (animationRef.current && flyAwayRef.current === "false") {
                startStaticAnimationsTrue();
            }
            if (animationRef.current && flyAwayRef.current === "true") {
                startStaticAnimationsFalse();
            }

            // If flyAwayRef is false, continue normal animation
            if (!animationRef.current) {
                startStaticAnimationsFalse();
            }

            if (flyAwayRef.current === "false") {
                animateMultiplier(stage, fifthLayer, thirdLayer);
            }
            // animateFlyingPlane(stage, fourthLayer);
            startAnimation();

            // Cleanup on unmount or when the animation ends
            return () => {
                cleanup();
            };
        }
    }, [flyAwayRef.current, animationRef.current]);

    function drawAnimatedBackground(thirdLayer: any, stage: any) {
        let currentBackgroundSize: any = 'none';
        let newBackgroundSize: any = 'none';
        const currentMultiplier = parseFloat(multiplierRef.current);
        if (currentMultiplier === null && currentMultiplier < 1) return;
        switch (true) {
            case currentMultiplier < 2:
                newBackgroundSize = 'small';
                break;
            case currentMultiplier < 10:
                newBackgroundSize = 'medium';
                break;
            case currentMultiplier < 20:
                newBackgroundSize = 'large';
                break;
            case currentMultiplier < 50:
                newBackgroundSize = 'large';
                break;
            case currentMultiplier < 100:
                newBackgroundSize = 'large';
                break;
            default:
                newBackgroundSize = 'large';
                break;
        }
        if (newBackgroundSize !== currentBackgroundSize) {
            AnimateFlyingPlaneBackground(newBackgroundSize, thirdLayer, stage);
            currentBackgroundSize = newBackgroundSize;
        }
        if (flyAwayRef.current === "true") {
            AnimateFlyingPlaneBackground('none', thirdLayer, stage);
        }
    }

    function drawCenteredEggShape(layer: any, stage: any, colors: { center: string, edge: string, fade: string }): void {
        const canvasWidth = stage.width();
        const canvasHeight = stage.height();

        // Center coordinates of the canvas
        const centerX = canvasWidth / 2;
        const centerY = canvasHeight / 2;

        const reflectionOval = new window.Konva.Shape({
            sceneFunc: (context: any, shape: any) => {
                context.save();

                // Define oval dimensions extending significantly beyond canvas
                const ovalWidth = canvasWidth + 200; // Extend far left and right
                const ovalHeight = canvasHeight * 1.2; // Extend above and below canvas

                // Create a radial gradient for the reflection effect
                const gradient = context.createRadialGradient(
                    centerX,
                    centerY,
                    0, // Inner circle
                    centerX,
                    centerY,
                    Math.max(ovalWidth / 2, ovalHeight / 2) // Outer circle
                );

                // Use passed colors for the reflection gradient
                gradient.addColorStop(0, colors.center); // Strong center
                gradient.addColorStop(0.4, colors.edge);  // Edge color, for fading effect
                gradient.addColorStop(1, 'rgba(0, 0, 0, 0)'); // Fully transparent at the edges

                context.fillStyle = gradient;

                // Draw the oval with dimensions far larger than the canvas
                context.beginPath();
                context.ellipse(centerX, centerY, ovalWidth / 2, ovalHeight / 2, 0, 0, Math.PI * 2);
                context.fill();

                // Add a vertical fade mask to the top and bottom
                const fadeGradient = context.createLinearGradient(
                    0,
                    centerY - ovalHeight / 2 - 100, // Extend above the top
                    0,
                    centerY + ovalHeight / 2 + 100 // Extend below the bottom
                );
                fadeGradient.addColorStop(0, 'rgba(0, 0, 0, 0)'); // Fully transparent
                fadeGradient.addColorStop(0.4, colors.fade);  // Fade color, customizable
                fadeGradient.addColorStop(0.6, colors.fade);  // Consistent fade in the middle
                fadeGradient.addColorStop(1, 'rgba(0, 0, 0, 0)'); // Fully transparent at the bottom

                context.globalCompositeOperation = 'source-atop';
                context.fillStyle = fadeGradient;
                context.fillRect(0, 0, canvasWidth, canvasHeight);

                context.restore();

                // Finalize the shape
                context.fillStrokeShape(shape);
            },
        });

        // Add shape to layer
        layer.add(reflectionOval);

        // Redraw the layer
        layer.draw();
    }

    function drawRotatingBeams(speed: number, backgroundLayer: any) {
        let height = backgroundLayer.height();
        let width = backgroundLayer.width();

        const totalBeams = 72;
        let rotationAngle = 0;
        const beamLength = Math.sqrt(width ** 2 + height ** 2);
        const angleStep = (2 * Math.PI) / totalBeams;
        let beams: any[] = []; // Store beams for reuse

        // Create beams once and reuse them
        for (let i = 0; i < totalBeams; i++) {
            const beam = new window.Konva.Line({
                points: [0, height, 0, height, 0, height, 0, height], // Placeholder points
                fill: i % 2 === 0 ? "#000000" : "#0c0c0c", // Alternate color
                closed: true,
            });
            backgroundLayer.add(beam);
            beams.push(beam);
        }

        function animate() {
            for (let i = 0; i < totalBeams; i++) {
                const startAngle = rotationAngle + i * angleStep;
                const endAngle = startAngle + angleStep;

                // Update points for each beam
                beams[i].points([
                    0, height, // Start point at the bottom
                    Math.cos(startAngle) * beamLength, height + Math.sin(startAngle) * beamLength, // First end
                    Math.cos(endAngle) * beamLength, height + Math.sin(endAngle) * beamLength, // Second end
                    0, height, // End point at the bottom
                ]);
            }

            rotationAngle = (rotationAngle + speed) % (2 * Math.PI);
            backgroundLayer.batchDraw(); // Efficiently draw the updated layer
            requestAnimationFrame(animate);
        }

        animate(); // Start the animation
    }

    function AnimateLeftAndBottomCanvasBorder(layer: any, stage: any) {
        const dotRadius = 2;
        let dotPositionY = 0;
        const dotSpacingY = 40;
        const borderOffset = 30;
        const dotSpeed = 0.5;
        const disappearOffsetY = 30;

        let whiteDotPositions: number[] = [];
        const dotSpacingX = 100;
        const xAxisOffset = 30;
        const layerWidth = layer.width();
        const layerHeight = layer.height();

        // Initialize horizontal dots
        function initWhiteDots() {
            for (let i = 0; i < layerWidth / dotSpacingX + 1; i++) {
                whiteDotPositions.push(layerWidth - i * dotSpacingX);
            }
        }

        // Draw static borders
        function drawBorders() {
            const leftBorder = new window.Konva.Line({
                points: [borderOffset, 0, borderOffset, layerHeight - borderOffset],
                stroke: "white",
                strokeWidth: 0.1,
            });

            const bottomBorder = new window.Konva.Line({
                points: [
                    borderOffset,
                    layerHeight - borderOffset,
                    layerWidth,
                    layerHeight - borderOffset,
                ],
                stroke: "white",
                strokeWidth: 0.1,
            });

            layer.add(leftBorder);
            layer.add(bottomBorder);
            layer.draw();
        }

        // Draw dots moving vertically along the left border
        function drawDotsY() {
            layer.find(".vertical-dot").forEach((node: any) => node.destroy()); // Clear previous dots

            for (let i = dotPositionY; i < layerHeight - disappearOffsetY; i += dotSpacingY) {
                const dot = new window.Konva.Circle({
                    x: borderOffset - 15,
                    y: i,
                    radius: dotRadius,
                    fill: "rgb(8, 180, 228)",
                    name: "vertical-dot",
                });

                layer.add(dot);
            }

            dotPositionY += dotSpeed;

            if (dotPositionY >= dotSpacingY) {
                dotPositionY = 0;
            }
        }

        // Draw dots moving horizontally along the bottom border
        function drawDotsX() {
            layer.find(".horizontal-dot").forEach((node: any) => node.destroy());

            for (let i = 0; i < whiteDotPositions.length; i++) {
                const posX = whiteDotPositions[i];

                if (posX > xAxisOffset) {
                    const dot = new window.Konva.Circle({
                        x: posX,
                        y: layerHeight - borderOffset + 15,
                        radius: dotRadius,
                        fill: "white",
                        name: "horizontal-dot",
                    });

                    layer.add(dot);
                }

                whiteDotPositions[i] -= dotSpeed;

                if (whiteDotPositions[i] <= xAxisOffset) {
                    const maxPosX = Math.max(...whiteDotPositions);
                    whiteDotPositions[i] = maxPosX + dotSpacingX;
                }
            }
        }

        function animate() {
            drawDotsY();
            drawDotsX();
            layer.batchDraw();
            requestAnimationFrame(animate);
        }

        initWhiteDots();
        drawBorders();
        animate();
    }

    function showLoaderGif(layer: any) {
        const canvas = document.createElement('canvas');
        canvas.className = "aviatorCanvas";
    
        function onDrawFrame(ctx: any, frame: any) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(frame.buffer, frame.x, frame.y);
            layer.draw(); // Redraw the layer with the updated GIF frame
        }
    
        window.gifler('assets/images/loader.gif').frames(canvas, onDrawFrame, true);
    
        // Initial dimensions
        let loaderWidth = 100;
        let loaderHeight = 100;
    
        // Create a Konva Image from the canvas for the loader
        const loaderImage = new window.Konva.Image({
            image: canvas,
            width: loaderWidth,
            height: loaderHeight,
            x: (layer.width() - loaderWidth) / 2, // Centered initially
            y: layer.height() * 0.1, // Fixed Y position
            visible: true,
            draggable: true,
        });
    
        layer.add(loaderImage);
    
        // Function to update loaderImage on resize
        function updateLoaderImage() {
            const stageWidth = layer.getStage().width();
    
            // Adjust width dynamically (keeping it proportional)
            loaderWidth = Math.min(stageWidth * 0.1, 150); // Max width 150px
            loaderHeight = loaderWidth; // Keep it square
    
            // Update position and size
            loaderImage.width(loaderWidth);
            loaderImage.height(loaderHeight);
            loaderImage.x((stageWidth - loaderWidth) / 2);
            layer.batchDraw(); // Apply changes
        }
    
        // Listen for window resize and update loader image
        window.addEventListener("resize", updateLoaderImage);
    }
    
    function showPlaneGif(layer: any, x: number, y: number) {
        const canvas = document.createElement('canvas');
        canvas.className = "aviatorCanvas";
    
        function onDrawFrame(ctx: any, frame: any) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(frame.buffer, frame.x, frame.y);
            layer.draw(); // Redraw the plane layer with updated GIF frame
        }
    
        window.gifler('assets/images/plane.gif').frames(canvas, onDrawFrame, true);
    
        // Initial dimensions
        let planeWidth = 160;
        let planeHeight = 80;
        const stageWidth = layer.getStage().width();
    
        // Normalize X position as a percentage of stage width
        let xPercentage = x / stageWidth; // Keep x relative to screen width
    
        // Create a Konva Image for the plane
        const planeImage = new window.Konva.Image({
            image: canvas,
            width: planeWidth,
            height: planeHeight,
            x: x, // Keep initial x position
            y: y,
            visible: true,
            draggable: true,
        });
    
        layer.add(planeImage);
        planeImage.position({ x: Math.max(0, x), y: Math.max(0, y) });
        layer.batchDraw(); // Redraw layer
    
        // Function to update plane size and position on resize
        function updatePlaneSize() {
            const newStageWidth = layer.getStage().width();
    
            // Adjust width while maintaining aspect ratio
            planeWidth = Math.min(newStageWidth * 0.15, 200); // Max width: 200px
            planeHeight = planeWidth * (80 / 160); // Maintain aspect ratio
    
            // Update plane size
            planeImage.width(planeWidth);
            planeImage.height(planeHeight);
    
            // Maintain X position proportionally
            planeImage.x(newStageWidth * xPercentage);
    
            layer.batchDraw();
        }
    
        // Listen for window resize
        window.addEventListener("resize", updatePlaneSize);
    
        return planeImage;
    }

    function AnimateWaitingForBets(layer: any, stage: any, thirdLayer: any) {
        const fullWidth = 150;
        const duration = 5000;
        const loaderHeight = 7;
        const backgroundColor = "#21232a";
        const loaderYPosition = stage.height() * 0.8;
        const textYPosition = stage.height() * 0.6;
        let progressWidth = fullWidth;
        let startTime = performance.now();
        let animationFrameId: number;

        // Create loader elements (only once)
        const loaderBg = new window.Konva.Rect({
            x: (stage.width() - fullWidth) / 2,
            y: loaderYPosition,
            width: fullWidth,
            height: loaderHeight,
            fill: backgroundColor,
            cornerRadius: 5,
        });

        const loaderProgress = new window.Konva.Rect({
            x: (stage.width() - fullWidth) / 2,
            y: loaderYPosition,
            width: progressWidth,
            height: loaderHeight,
            fill: "#c80432",
            cornerRadius: 5,
        });

        const text = new window.Konva.Text({
            text: "WAITING FOR NEXT ROUND",
            x: 0,
            y: textYPosition,
            width: stage.width(),
            align: "center",
            fill: "#fff",
            fontSize: Math.max(20, stage.width() / 25),
            draggable: true,
        });

        // Add elements to the layer
        layer.add(loaderBg, loaderProgress, text);
        layer.batchDraw(); // Initial draw


        // Animate loader progress
        function animateLoader(timestamp: number) {
            const elapsed = timestamp - startTime;
            progressWidth = Math.max(0, fullWidth - (fullWidth * (elapsed / duration)));

            loaderProgress.width(progressWidth); // Update the progress bar width dynamically
            layer.batchDraw(); // Redraw the layer with updated progress

            // Continue animation if duration has not been reached
            if (elapsed < duration) {
                animationFrameId = requestAnimationFrame(animateLoader);
            } else {
                hideloader(); // Hide loader once the animation completes
            }
        }

        function hideloader() {
            loaderBg.destroy();
            loaderProgress.destroy();
            text.destroy();
            layer.destroy();
        }
        const planeWidth = Math.max(80, stage.width() / 7.5);
        const planeHeight = planeWidth / 2;
        showLoaderGif(layer);
        const planeImg = showPlaneGif(thirdLayer, 5, stage.height() - 105);
        planeImg.size({ width: planeWidth, height: planeHeight });
        animateLoader(performance.now());

        return () => {
            cancelAnimationFrame(animationFrameId);
            hideloader();
        };
    }

    function AnimateFlewAwayText(maxMultiplier: any, layer: any, stage: any) {
        const displayTime: number = 2000;
        let startTime: number | null = null;

        const text: string = `${maxMultiplier}x`;

        // Create the texts once at the beginning
        const flewAwayText = new window.Konva.Text({
            text: "FLEW AWAY!",
            x: 0, // Center horizontally
            y: stage.height() * 0.25, // Vertical position
            width: stage.width(),
            align: "center",
            fill: "#fff",
            fontSize: Math.max(20, stage.width() * 0.03),
            draggable: true,
        });

        const multiplierText = new window.Konva.Text({
            text: text,
            x: 0, // Center horizontally
            y: stage.height() / 2, // Position below "FLEW AWAY!"
            width: stage.width(),
            align: "center",
            fill: "#d0021b",
            fontSize: Math.max(20, stage.width() * 0.10),
            draggable: true,
        });

        // Add text to the layer once
        layer.add(flewAwayText, multiplierText);
        layer.batchDraw();

        function drawText(timestamp: number): void {
            if (!startTime) startTime = timestamp; // Set the start time on the first frame

            const elapsed: number = timestamp - startTime;

            // Animate texts (you can add animations like fading or moving)
            if (elapsed < displayTime) {
                requestAnimationFrame(drawText); // Continue animation
            } else {
                // Hide or remove texts after displayTime
                flewAwayText.hide();
                multiplierText.hide();
                layer.batchDraw();
            }
        }

        requestAnimationFrame(drawText);
    }

    function AnimateFlyingPlaneBackground(size: 'small' | 'medium' | 'large' | 'none', layer: any, stage: any): void {
        // Function to draw the blue (small) background using Konva layer
        function drawSmall(): void {
            drawCenteredEggShape(layer, stage, {
                center: 'rgba(35, 100, 137, 0.8)', // Blue center
                edge: 'rgba(35, 100, 137, 0.15)',  // Lighter blue edge
                fade: 'rgba(0, 0, 0, 0.2)'         // Light fade at top and bottom
            });
        }

        // Function to draw the purple (medium) background using Konva layer
        function drawMedium(): void {
            drawCenteredEggShape(layer, stage, {
                center: 'rgba(140, 40, 220, 0.8)',  // Purple center
                edge: 'rgba(140, 40, 220, 0.15)',   // Fading purple edge
                fade: 'rgba(0, 0, 0, 0.3)'         // Purple fade effect
            });
        }

        // Function to draw the pink (large) background using Konva layer
        function drawLarge(): void {
            drawCenteredEggShape(layer, stage, {
                center: 'rgba(255, 105, 180, 0.8)', // Pink center
                edge: 'rgba(255, 105, 180, 0.15)',  // Lighter pink edge
                fade: 'rgba(0, 0, 0, 0.3)'         // Soft pink fade
            });
        }

        // Remove any existing loaders or backgrounds
        function removeDrawing(): void {
            // Remove all children from the single passed Konva layer
            layer.destroyChildren();
            layer.draw(); // Re-render the layer without any children
        }

        // Add background based on the selected size using Konva layer
        switch (size) {
            case 'none':
                removeDrawing();
                break;
            case 'small':
                removeDrawing(); // Remove previous background if any
                drawSmall();
                break;
            case 'medium':
                removeDrawing(); // Remove previous background if any
                drawMedium();
                break;
            case 'large':
                removeDrawing(); // Remove previous background if any
                drawLarge();
                break;
            default:
                console.error('Invalid size parameter. Use "small", "medium", or "large".');
                return;
        }
    }

    const animateMultiplier = (stage: any, fifthLayer: any, thirdLayer: any): void => {
        const multiplierText = new window.Konva.Text({
            text: `${multiplierRef.current}x`,
            x: 0,
            y: stage.height() / 2,
            width: stage.width(),
            align: 'center',
            fill: '#fff',
            fontSize: Math.max(20, stage.width() / 10),
            draggable: true,
        });

        fifthLayer.add(multiplierText);
        fifthLayer.batchDraw();

        const animate = () => {
            const currentMultiplier = parseFloat(multiplierRef.current);

            multiplierText.text(`${multiplierRef.current}x`);
            fifthLayer.batchDraw();

            if (flyAwayRef.current === "true") {
                multiplierText.destroy();
                fifthLayer.batchDraw();
            } else {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    };

    function animateFlyingPlane(stage: any, fourthLayer: any) {
        const engineStartAudio = new Audio('/assets/audio/aviatortakeoff.mp3');
        const flyAwayAudio = new Audio('/assets/audio/aviatorflewaway.mp3');

        const runwayEnd = fourthLayer.width() * 0.12;
        let floatEnd: any;
        let fixedHeight: any;
        let fixedEndHeight: any;
        console.log(`My canvas width is ${fourthLayer.width()}px...`)
        if (fourthLayer.width() < 412) {
            floatEnd = fourthLayer.width() * 0.75;
            fixedHeight = 60;
            fixedEndHeight = 55;
            velocity.current = 1;
        } else if (fourthLayer.width() > 1080) {
            floatEnd = fourthLayer.width() * 0.8;
            fixedHeight = 80;
            fixedEndHeight = 70;
        } else if (fourthLayer.width() >= 1024 && fourthLayer.width() <= 1080) {
            floatEnd = fourthLayer.width() * 0.8;
            fixedHeight = 60;
        } else if (fourthLayer.width() >= 412 && fourthLayer.width() < 740) {
            floatEnd = fourthLayer.width() * 0.8;
            fixedHeight = 60;
            fixedEndHeight = 55;
        } else if (fourthLayer.width() >= 740 && fourthLayer.width() <= 1024) {
            floatEnd = fourthLayer.width() * 0.8;
            fixedHeight = 70;
            fixedEndHeight = 60;
        }
        let hasEngineStarted = false;
        let hasFlownAway = false;
        let floatOffset = 0.05;
        let floatAmplitude: any;
        if (fourthLayer.height() > 400) {
            floatAmplitude = Math.floor(Math.random() * (90 - 60 + 1)) + 60;
        } else if (fourthLayer.height() < 235) {
            floatAmplitude = Math.floor(Math.random() * (60 - 40 + 1)) + 40;
        }

        // Given constants for fixed values
        const fixedWidth = 160;
        const fixedXPosition = -15;
        const fixedYPosition = 105;

        // New calculated plane dimensions
        const planeWidth = Math.max(80, fourthLayer.width() / 7.5);
        const planeHeight = planeWidth / 2;

        // Calculate scaling ratios for width and height
        const widthRatio = planeWidth / fixedWidth;
        const heightRatio = planeHeight / fixedHeight;

        // Calculate new positions using the scaling ratios
        const newEndHeight = fixedEndHeight * heightRatio;
        const newXPosition = fixedXPosition * widthRatio;
        const newYPosition = stage.height() - (fixedYPosition * heightRatio);

        const floatSpeed = 0.025;
        const tHeight = fourthLayer.height() * 0.4 - newEndHeight;
        const targetHeight = fourthLayer.height() * 0.4;

        position.current.x = newXPosition;
        position.current.y = newYPosition;
        const planeImage = showPlaneGif(fourthLayer, position.current.x, position.current.y);

        // Original single line trail (sharp line)
        const trailLine = new window.Konva.Path({
            data: '',
            stroke: '#d40034', // Bright red color
            strokeWidth: 5,
            lineCap: 'round',
            lineJoin: 'round',
        });
        fourthLayer.add(trailLine);

        // Closed trail with fill (soft glowing effect)
        const trailFill = new window.Konva.Path({
            data: '',
            stroke: 'transparent',
            strokeWidth: 1,
            fill: '#d60c3e7c',
            closed: true,
        });
        fourthLayer.add(trailFill);

        function updateTrails(x: number, y: number) {
            let linePathData = `M30,${fourthLayer.height() - 33} `;
            let fillPathData = `M30,${fourthLayer.height() - 35} `;

            if (x <= runwayEnd) {
                // Straight line and fill for the runway
                linePathData += `L${x},${fourthLayer.height() - 35} `;
                fillPathData += `L${x},${fourthLayer.height() - 35} `;
            } else {
                // Smooth transition with a quadratic curve
                const controlX = runwayEnd + (x - runwayEnd) / 2;
                const controlY = fourthLayer.height() - 35; // Control point height for curve
                linePathData += `Q${controlX},${controlY} ${x},${y} `;
                fillPathData += `Q${controlX},${controlY} ${x},${y} `;
            }

            // Extend fill path to close the shape
            fillPathData += `L${x},${fourthLayer.height() - 30} L30,${fourthLayer.height() - 30} Z`;

            trailLine.data(linePathData); // Update sharp single line
            trailFill.data(fillPathData); // Update filled shape
            fourthLayer.batchDraw(); // Redraw the layer
        }

        function animatePlaneFlying() {
            let newX = position.current.x;
            let newY = position.current.y;
            let trailnewX = trailposition.current.x;
            let trailnewY = trailposition.current.y;

            if (flyAwayRef.current === "true") {
                if (!hasFlownAway && musicRef.current) {
                    engineStartAudio.pause();
                    flyAwayAudio.play();
                    hasFlownAway = true;
                }

                velocity.current = 10;
                newX += velocity.current;

                if (newX > fourthLayer.width()) {
                    // Reset after flying away
                    fourthLayer.destroy();
                    // Reset position for the new round
                    newX = newXPosition;
                    trailnewX = newXPosition;
                    position.current = { x: newX, y: newYPosition };
                    trailposition.current = { x: trailnewX, y: newYPosition };
                    planeImage.position({ x: newX, y: newYPosition });
                    planeImage.size({ width: planeWidth, height: planeHeight });
                    updateTrails(trailnewX, newYPosition); // Reset the trail
                    fourthLayer.batchDraw();
                    hasFlownAway = false; // Reset the flag for the next round
                    return; // Restart the animation after flying away
                }
            } else if (flyAwayRef.current === "false") {

                if (!hasEngineStarted && musicRef.current && eventRef.current && newX <= 10) {
                    engineStartAudio.play();
                    hasEngineStarted = true;
                }

                newX += velocity.current;
                trailnewX += velocity.current;

                // Handle runway end to float transition
                if (newX <= runwayEnd) {
                    newY = newYPosition;
                    trailnewY = fourthLayer.height() - 35;
                } else if (newX <= floatEnd) {
                    // Smooth transition from runway to floatEnd
                    const trailprogress = (trailnewX - runwayEnd) / (floatEnd - runwayEnd);
                    const progress = (newX - runwayEnd) / (floatEnd - runwayEnd);
                    newY = (newYPosition) - progress * ((newYPosition) - tHeight);
                    trailnewY = (fourthLayer.height() - 35) - trailprogress * ((fourthLayer.height() - 35) - targetHeight);

                } else {
                    // Stop horizontal movement when reaching floatEnd
                    newX = floatEnd; // Lock newX at floatEnd once it is reached
                    trailnewX = floatEnd - newXPosition;
                    // Floating effect: sinusoidal oscillation on the vertical axis
                    newY = tHeight + Math.sin(floatOffset) * floatAmplitude;
                    trailnewY = targetHeight + Math.sin(floatOffset) * floatAmplitude;
                    floatOffset += floatSpeed; // Update offset for next frame
                }
            }

            // Update position of plane
            position.current = { x: newX, y: newY };
            trailposition.current = { x: trailnewX, y: trailnewY };
            planeImage.position({ x: newX, y: newY });
            planeImage.size({ width: planeWidth, height: planeHeight });
            updateTrails(trailnewX, trailnewY); // Update trails
            fourthLayer.batchDraw(); // Redraw the layer
            requestAnimationFrame(animatePlaneFlying);
        }

        animatePlaneFlying(); // Start the animation

        return () => {
            engineStartAudio.pause();
            flyAwayAudio.pause();
            planeImage.destroy();
            trailLine.destroy();
            trailFill.destroy();
            fourthLayer.batchDraw();
        };
    }

    return (
        <>
            <div id="aviator-game-canvas" className="aviator-game-canva display-center">
                <div id="aviatorCanvas"></div>
            </div>
        </>
    );
}
