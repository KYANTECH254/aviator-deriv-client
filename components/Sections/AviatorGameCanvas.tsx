// "use client"
// import { useState, useRef, useEffect } from "react";

// export default function AviatorGameCanvas() {
//     const [multiplier, setMultiplier] = useState(1.00);
//     const [maxMultiplier, setmaxMultiplier] = useState<number>(11.00);
//     const canvasRef = useRef<HTMLCanvasElement | null>(null);
//     const position = useRef({ x: 35, y: 0 });
//     const velocity = useRef<number>(1);
//     const [flyAway, setFlyAway] = useState<boolean>(false);
//     const [isMusicPlaying, setIsMusicPlaying] = useState<boolean>(false);
//     const engineStartAudio = useRef<HTMLAudioElement | null>(null);
//     const flyAwayAudio = useRef<HTMLAudioElement | null>(null);
//     const isWaitingForBets = useRef(false);
//     const isAnimatingRef = useRef(false);
//     const flyAwayRef = useRef(flyAway)

//     const floatAmplitude = 70;
//     const floatSpeed = 0.02;
//     let floatOffset = 0;
//     let frameId: number;

//     useEffect(() => {
//         window.addEventListener('resize', resizeCanvas);
//         resizeCanvas();
//         readySettings();
//         startGameTransition();

//         return () => {
//             window.removeEventListener('resize', resizeCanvas);
//             if (isWaitingForBets.current) {
//             }
//         };
//     }, []);
    
//     function readySettings() {
//         const Animate = JSON.parse(localStorage.getItem('animationPlaying') as string) as boolean;
//         isAnimatingRef.current = Animate; // Use ref to update the animation state
//     }
    
//     function playAudio(audioRef:any) {
//         const shouldPlay = localStorage.getItem('isMusicPlaying') === 'true';
//         if (shouldPlay && audioRef.current) {
//             audioRef.current.play();
//         }
//     }    

//     function animateCanvasBackground(speed: number) {
//         const canvas: any = canvasRef.current;
//         if (!canvas) return;
//         const ctx: any = canvas.getContext('2d');
//         if (!ctx) return;

//         const totalBeams = 72;
//         let rotationAngle = 0;

//         function drawRotatingBeams() {
//             const beamLength = Math.sqrt(canvas.width ** 2 + canvas.height ** 2);
//             ctx.clearRect(0, 0, canvas.width, canvas.height);
//             const angleStep = (2 * Math.PI) / totalBeams;
//             let isDark = true;

//             for (let i = 0; i < totalBeams; i++) {
//                 ctx.beginPath();
//                 const startAngle = rotationAngle + i * angleStep;
//                 const endAngle = startAngle + angleStep;

//                 ctx.moveTo(0, canvas.height);
//                 ctx.lineTo(
//                     Math.cos(startAngle) * beamLength,
//                     canvas.height + Math.sin(startAngle) * beamLength
//                 );
//                 ctx.lineTo(
//                     Math.cos(endAngle) * beamLength,
//                     canvas.height + Math.sin(endAngle) * beamLength
//                 );
//                 ctx.lineTo(0, canvas.height);

//                 ctx.fillStyle = isDark ? '#000000' : '#0c0c0c';
//                 isDark = !isDark;
//                 ctx.fill();
//                 ctx.closePath();
//             }

//             rotationAngle = (rotationAngle + speed) % (2 * Math.PI);
//             requestAnimationFrame(drawRotatingBeams);
//         }

//         drawRotatingBeams();
//     }

//     function AnimateLeftAndBottomCanvasBorder(animate: boolean) {
//         if (animate === true) {
//             const canvas: any = canvasRef.current;
//             if (!canvas) return;
//             const ctx: any = canvas.getContext('2d');
//             if (!ctx) return;

//             const dotRadius = 2; // Static radius for dots
//             let dotPositionY = 0;
//             const dotSpacingY = 40;
//             const borderOffset = 30;
//             const dotSpeed = 0.5;
//             const disappearOffsetY = 30;

//             let whiteDotPositions: number[] = [];
//             const dotSpacingX = 100;
//             const xAxisOffset = 30;
//             const initialDotPositionX = canvas.width;

//             function initWhiteDots() {
//                 for (let i = 0; i < canvas.width / dotSpacingX + 1; i++) {
//                     whiteDotPositions.push(initialDotPositionX - i * dotSpacingX);
//                 }
//             }

//             function drawBorders() {
//                 ctx.beginPath();
//                 ctx.moveTo(borderOffset, 0);
//                 ctx.lineTo(borderOffset, canvas.height - borderOffset);
//                 ctx.strokeStyle = 'white';
//                 ctx.lineWidth = 0.1;
//                 ctx.stroke();

//                 ctx.beginPath();
//                 ctx.moveTo(borderOffset, canvas.height - borderOffset + 1);
//                 ctx.lineTo(canvas.width, canvas.height - borderOffset - 1);
//                 ctx.strokeStyle = 'white';
//                 ctx.lineWidth = 0.1;
//                 ctx.stroke();
//             }

//             function drawDotsY() {
//                 for (let i = dotPositionY; i < canvas.height - disappearOffsetY; i += dotSpacingY) {
//                     ctx.beginPath();
//                     ctx.arc(borderOffset - 15, i, dotRadius, 0, Math.PI * 2); // Fixed radius
//                     ctx.fillStyle = 'rgb(8, 180, 228)';
//                     ctx.fill();
//                     ctx.closePath();
//                 }

//                 dotPositionY += dotSpeed;

//                 if (dotPositionY >= dotSpacingY) {
//                     dotPositionY = 0;
//                 }
//             }

//             function drawDotsX() {
//                 for (let i = 0; i < whiteDotPositions.length; i++) {
//                     let posX = whiteDotPositions[i];

//                     if (posX > xAxisOffset) {
//                         ctx.beginPath();
//                         ctx.arc(posX, canvas.height - borderOffset + 15, dotRadius, 0, Math.PI * 2); // Fixed radius
//                         ctx.fillStyle = 'white';
//                         ctx.fill();
//                         ctx.closePath();
//                     }

//                     whiteDotPositions[i] -= dotSpeed;

//                     if (whiteDotPositions[i] <= xAxisOffset) {
//                         let maxPosX = Math.max(...whiteDotPositions);
//                         whiteDotPositions[i] = maxPosX + dotSpacingX;
//                     }
//                 }
//             }

//             function animate() {
//                 drawBorders();
//                 drawDotsY();
//                 drawDotsX();
//                 requestAnimationFrame(animate);
//             }

//             initWhiteDots();
//             animate();
//         }
//     }

//     function AnimateWaitingForBets() {
//         animateCanvasBackground(0.0);
    
//         const canvas: HTMLCanvasElement = canvasRef.current!;
//         if(!canvas) return;
//         const ctx: CanvasRenderingContext2D = canvas.getContext('2d')!;
//         let progressWidth = 150;
//         const fullWidth = 150;
//         const duration = 5000;
//         let startTime = performance.now();
//         const loaderHeight = 7;
//         const backgroundColor = '#21232a';
//         let animationFrameId: number;
//         const loaderYPosition = canvas.height * 0.80;
    
//         function getResponsiveFontSize(): string {
//             const fontSize = Math.max(20, canvas.width / 25);
//             return `${fontSize}px Poppins`;
//         }
    
//         function getResponsivePlaneSize() {
//             const planeWidth = Math.max(80, canvas.width / 10);
//             const planeHeight = planeWidth / 2; 
//             return { planeWidth, planeHeight };
//         }
    
//         function drawRoundedRect(x: number, y: number, width: number, height: number, radius: number) {
//             ctx.beginPath();
//             ctx.moveTo(x + radius, y);
//             ctx.lineTo(x + width - radius, y);
//             ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
//             ctx.lineTo(x + width, y + height - radius);
//             ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
//             ctx.lineTo(x + radius, y + height);
//             ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
//             ctx.lineTo(x, y + radius);
//             ctx.quadraticCurveTo(x, y, x + radius, y);
//             ctx.closePath();
//         }
    
//         function drawLoader() {
//             ctx.font = getResponsiveFontSize();
//             ctx.textAlign = 'center';
//             ctx.fillStyle = '#fff';
//             ctx.fillText('WAITING FOR NEXT ROUND', canvas.width / 2, canvas.height * 0.70);
    
//             ctx.fillStyle = backgroundColor;
//             drawRoundedRect((canvas.width - fullWidth) / 2, loaderYPosition, fullWidth, loaderHeight, 5);
//             ctx.fill();
    
//             ctx.fillStyle = '#c80432';
//             drawRoundedRect((canvas.width - fullWidth) / 2, loaderYPosition, progressWidth, loaderHeight, 5);
//             ctx.fill();
//         }
    
//         function animateLoader(timestamp: number) {
//             const elapsed = timestamp - startTime;
//             progressWidth = Math.max(0, fullWidth - (fullWidth * (elapsed / duration)));
    
//             drawLoader();
    
//             if (elapsed < duration) {
//                 animationFrameId = requestAnimationFrame(animateLoader);
//             } else {
//                 // Hide loader and plane only once after the duration is complete
//                 hideloader();
//                 hideplane();
//                 progressWidth = fullWidth; // Ensure progress is complete
//             }
//         }
    
//         function showplane() {
//             const plane: any = document.querySelector<HTMLElement>("#aviator-static-plane");
//             if (plane) {
//                 plane.style.display = 'flex';
//                 const responsive = getResponsivePlaneSize();
//                 plane.style.width = responsive.planeWidth;
//                 plane.style.height = responsive.planeHeight;
//             }
//         }
    
//         function showloader() {
//             const loader = document.querySelector<HTMLElement>("#aviator-static-loader");
//             if (loader) {
//                 loader.style.display = 'flex';
//                 loader.style.top = `${canvas.height * 0.1}px`;
//             }
//         }
    
//         function hideplane() {
//             const plane = document.querySelector<HTMLElement>("#aviator-static-plane");
//             if (plane) {
//                 plane.style.display = 'none';
//             }
//         }
    
//         function hideloader() {
//             const loader = document.querySelector<HTMLElement>("#aviator-static-loader");
//             if (loader) {
//                 loader.style.display = 'none';
//             }
//         }
    
//         function cleanup() {
//             cancelAnimationFrame(animationFrameId);
//             hideloader(); // Ensure loader is hidden on cleanup
//             hideplane(); // Ensure plane is hidden on cleanup
//         }
    
//         showloader();
//         showplane();
//         animateLoader(performance.now());
    
//         return cleanup;
//     }
    
//     function AnimateFlewAwayText(maxMultiplier: number) {
//         animateCanvasBackground(0.0);

//         const canvas: any = canvasRef.current;
//         if (!canvas) return;
//         const ctx: any = canvas.getContext('2d');
//         if (!ctx) return;

//         const displayTime: number = 5000;
//         let startTime: number | null = null;

//         const text: string = `${maxMultiplier}x`;

//         function drawText(timestamp: number): void {
//             if (!startTime) startTime = timestamp;
//             const elapsed: number = timestamp - startTime;

//             const fontSizeSmall: number = Math.max(20, canvas.width * 0.05);
//             ctx.font = `${fontSizeSmall}px Poppins`;
//             ctx.textAlign = 'center';
//             ctx.fillStyle = '#fff';
//             ctx.fillText('FLEW AWAY!', canvas.width / 2, 100);

//             const fontSizeLarge: number = Math.max(50, canvas.width * 0.15);
//             ctx.font = `500 ${fontSizeLarge}px Poppins`;
//             ctx.fillStyle = '#d0021b';
//             ctx.fillText(text, canvas.width / 2, 250);

//             if (elapsed < displayTime) {
//                 requestAnimationFrame(drawText);
//             }
//         }

//         requestAnimationFrame(drawText);
//     }

//     function AnimateFlyingPlaneBackground(size: 'small' | 'medium' | 'large' | 'none'): void {
//         function drawSmall(): void {
//             const loader = document.querySelector("#aviator-static-blue") as HTMLElement | null;
//             if (loader) {
//                 loader.style.display = 'flex';
//             }
//         }
    
//         function drawMedium(): void {
//             const loader = document.querySelector("#aviator-static-purple") as HTMLElement | null;
//             if (loader) {
//                 loader.style.display = 'flex';
//             }
//         }
    
//         function drawLarge(): void {
//             const loader = document.querySelector("#aviator-static-pink") as HTMLElement | null;
//             if (loader) {
//                 loader.style.display = 'flex';
//             }
//         }
    
//         function removeDrawing(): void {
//             const loaders = ["#aviator-static-pink", "#aviator-static-blue", "#aviator-static-purple"];
//             loaders.forEach(loaderId => {
//                 const loader = document.querySelector(loaderId) as HTMLElement | null;
//                 if (loader) {
//                     loader.style.display = 'none';
//                 }
//             });
//         }
    
//         switch (size) {
//             case 'none':
//                 removeDrawing();
//                 break; 
//             case 'small':
//                 drawSmall();
//                 break;
//             case 'medium':
//                 drawMedium();
//                 break;
//             case 'large':
//                 drawLarge();
//                 break;
//             default:
//                 console.error('Invalid size parameter. Use "small", "medium", or "large".');
//                 return;
//         }
//     }

//     const animateMultiplier = () => {
//         const multiplierElement = document.getElementById('multiplier') as HTMLElement | null;
//         if (!multiplierElement) return;
    
//         let multiplierSpeed = 0;
//         const currentMultiplier = parseFloat(multiplier.toFixed(2));
    
//         // Determine speed and background based on multiplier range
//         switch (true) {
//             case currentMultiplier < 2:
//                 multiplierSpeed = 0.001;
//                 AnimateFlyingPlaneBackground('small');
//                 break;
//             case currentMultiplier < 10:
//                 multiplierSpeed = 0.0015;
//                 AnimateFlyingPlaneBackground('medium');
//                 break;
//             case currentMultiplier < 20:
//                 multiplierSpeed = 0.002;
//                 AnimateFlyingPlaneBackground('large');
//                 break;
//             case currentMultiplier < 50:
//                 multiplierSpeed = 0.003;
//                 AnimateFlyingPlaneBackground('large');
//                 break;
//             case currentMultiplier < 100:
//                 multiplierSpeed = 0.005;
//                 AnimateFlyingPlaneBackground('large');
//                 break;
//             default:
//                 multiplierSpeed = 1;
//                 AnimateFlyingPlaneBackground('large');
//                 break;
//         }
    
//         const updatedMultiplier = multiplier + multiplierSpeed;
    
//         if (multiplierElement) {
//             multiplierElement.innerText = `${updatedMultiplier.toFixed(2)}x`;
//         }
    
//         // If maxMultiplier is reached, stop animation and trigger "flew away"
//         if (updatedMultiplier >= maxMultiplier) {
//             multiplierElement.style.display = 'none';
//             AnimateFlyingPlaneBackground('none');
//             AnimateFlewAwayText(maxMultiplier);
//             setFlyAway(true);
//         } else {
//             setMultiplier(updatedMultiplier);
//             requestAnimationFrame(animateMultiplier);
//         }
//     };
    
//     function animateFlyingPlane() {
//         const isflyAway = flyAwayRef.current;
//         engineStartAudio.current = new Audio('/assets/audio/aviatortakeoff.mp3');
//         flyAwayAudio.current = new Audio('/assets/audio/aviatorflewaway.mp3');
    
//         const musicFlag = localStorage.getItem('isMusicPlaying') === 'true';
//         setIsMusicPlaying(musicFlag);
    
//         const canvas:any = canvasRef.current;
//         if (!canvas) return;
//         const ctx:any = canvas.getContext('2d');
//         if (!ctx) return;
    
//         const canvasHeight = canvas.height;
//         canvas.height = canvasHeight;
    
//         const runwayEnd = canvas.width * 0.12;
//         const floatEnd = canvas.width * 0.8;
//         const targetHeight = canvas.height * 0.40;
//         const planeWidth = Math.max(80, canvas.width / 7.5);
//         const planeHeight = planeWidth / 2;
    
//         let hasEngineStarted = false;
//         let hasFlownAway = false;
    
//         function drawTrail(x:number, y:number) {
//             if (!isflyAway) {
//                 ctx.beginPath();
//                 ctx.moveTo(30, canvas.height - 35);
    
//                 if (x <= runwayEnd) {
//                     ctx.lineTo(x, canvas.height - 35);
//                 } else {
//                     const controlX = runwayEnd + (x - runwayEnd) / 2;
//                     const controlY = canvas.height - 35 - 5;
//                     ctx.quadraticCurveTo(controlX, controlY, x, y);
//                 }
    
//                 ctx.strokeStyle = "#d00237";
//                 ctx.lineWidth = 5;
//                 ctx.stroke();
//                 ctx.lineTo(x, canvas.height - 30);
//                 ctx.lineTo(30, canvas.height - 30);
//                 ctx.closePath();
//                 ctx.fillStyle = "rgba(255, 0, 0, 0.3)";
//                 ctx.fill();
//             }
    
//             const planeImg = document.getElementById('plane');
//             if (planeImg) {
//                 planeImg.style.left = `${x - planeWidth / 2}px`;
//                 planeImg.style.top = `${y - planeHeight / 2}px`;
//                 planeImg.style.display = 'block';
//                 planeImg.style.height = `${planeHeight}px`;
//                 planeImg.style.width = `${planeWidth}px`;
//             }
//         }
    
//         function animatePlaneFlying() {
//             const planeImg = document.getElementById('plane');
//             if (!planeImg) return;
//             let newX = position.current.x;
//             let newY = position.current.y;
    
//             if (isflyAway) {
//                 if (!hasFlownAway && isMusicPlaying) {
//                     engineStartAudio.current?.pause();
//                     flyAwayAudio.current?.play();
//                     hasFlownAway = true;
//                 }
    
//                 velocity.current = 30;
//                 newX += velocity.current;
    
//                 // Check if the plane is fully off-screen before stopping the animation
//                 if (newX >= canvas.width + planeWidth) {
//                     if (planeImg) planeImg.style.display = 'none';
//                     ctx.clearRect(0, 0, canvas.width, canvas.height);
//                     return;
//                 }
//             } else {
//                 if (!hasEngineStarted && isMusicPlaying) {
//                     engineStartAudio.current?.play();
//                     hasEngineStarted = true;
//                 }
    
//                 newX += velocity.current;
    
//                 if (newX <= runwayEnd) {
//                     newY = canvas.height - 35;
//                 } else if (newX <= floatEnd) {
//                     const progress = (newX - runwayEnd) / (floatEnd - runwayEnd);
//                     newY = (canvas.height - 35) - progress * ((canvas.height - 35) - targetHeight);
//                 } else {
//                     newX = floatEnd;
//                     newY = targetHeight + Math.sin(floatOffset) * floatAmplitude;
//                     floatOffset += floatSpeed;
//                 }
//             }
    
//             position.current = { x: newX, y: newY };
//             drawTrail(newX, newY);
    
//             frameId = requestAnimationFrame(animatePlaneFlying); // Continue animating
//         }
    
//         animatePlaneFlying(); // Start the animation
    
//         return () => cancelAnimationFrame(frameId);
//     }

//     function resizeCanvas() {
//         const width = window.innerWidth;
//         const height = window.innerHeight;

//         const canvas = canvasRef.current;
//         if (canvas) {
//             if (width > 768) {
//                 canvas.height = 400;
//             } else if (width < 768) {
//                 canvas.height = 230
//             }
//             const dpr = window.devicePixelRatio || 1;
//             canvas.width = canvas.offsetWidth * dpr;
//             canvas.height = canvas.offsetHeight * dpr;

//             const ctx = canvas.getContext('2d');
//             if (ctx) ctx.scale(dpr, dpr);
//         }

//     }

//     const startGameTransition = () => {
//         // Check if waiting for bets is already active
//         if (isWaitingForBets.current) return;
    
//         isWaitingForBets.current = true; // Prevent re-entry
//         const cleanup = AnimateWaitingForBets(); // Start the waiting for bets animation
    
//         // Use a variable to track if the transition should proceed
//         const transitionTimeout = setTimeout(() => {
            
//             isWaitingForBets.current = false; // Reset the waiting flag
    
//             // Check if the animation is still active before proceeding
//             if (!isAnimatingRef.current) {
//                 animateCanvasBackground(0.0);
//                 AnimateLeftAndBottomCanvasBorder(false);
//             } else {
//                 animateCanvasBackground(0.003);
//                 AnimateLeftAndBottomCanvasBorder(true);
//                 animateFlyingPlane();
//                 animateMultiplier();
//             }
//         }, 7000);
    
//         // Ensure that the timeout is cleared if the component unmounts or transitions stop
//         return () => {
//             clearTimeout(transitionTimeout); // Clear the timeout to avoid conflicts
//         };
//     };
    
//             // function AnimateFlyingPlaneBackground(size: 'small' | 'medium' | 'large' | 'none', layer: any): void {
//             //     // Function to draw the blue (small) background using Konva layer
//             //     function drawSmall(): void {

//             //         // const loader = document.querySelector("#aviator-static-blue") as HTMLElement | null;
//             //         // if (loader) {
//             //         //     loader.style.display = 'flex'; // Show the blue loader CSS
//             //         //     // You can also add any Konva elements to the passed layer if needed
//             //         // }

//             //         function drawCenteredEggShape(layer: any) {
//             //             const canvasWidth = stage.width();
//             //             const canvasHeight = stage.height();

//             //             // Center coordinates of the canvas
//             //             const centerX = canvasWidth / 2;
//             //             const centerY = canvasHeight / 2;

//             //             const reflectionOval = new window.Konva.Shape({
//             //                 sceneFunc: (context:any, shape:any) => {
//             //                     context.save();

//             //                     // Define oval dimensions extending significantly beyond canvas
//             //                     const ovalWidth = canvasWidth + 200; // Extend far left and right
//             //                     const ovalHeight = canvasHeight * 1.2; // Extend above and below canvas

//             //                     // Create a radial gradient for the reflection effect
//             //                     const gradient = context.createRadialGradient(
//             //                         centerX,
//             //                         centerY,
//             //                         0, // Inner circle
//             //                         centerX,
//             //                         centerY,
//             //                         Math.max(ovalWidth / 2, ovalHeight / 2) // Outer circle
//             //                     );

//             //                     // Gradient colors
//             //                     gradient.addColorStop(0, 'rgba(35, 100, 137, 0.8)'); // Strong center
//             //                     gradient.addColorStop(0.4, 'rgba(35, 100, 137, 0.15)');
//             //                     gradient.addColorStop(1, 'rgba(0, 0, 0, 0)'); // Fully transparent

//             //                     context.fillStyle = gradient;

//             //                     // Draw the oval with dimensions far larger than the canvas
//             //                     context.beginPath();
//             //                     context.ellipse(centerX, centerY, ovalWidth / 2, ovalHeight / 2, 0, 0, Math.PI * 2);
//             //                     context.fill();

//             //                     // Add a vertical fade mask to the top and bottom
//             //                     const fadeGradient = context.createLinearGradient(
//             //                         0,
//             //                         centerY - ovalHeight / 2 - 100, // Extend above the top
//             //                         0,
//             //                         centerY + ovalHeight / 2 + 100 // Extend below the bottom
//             //                     );
//             //                     fadeGradient.addColorStop(0, 'rgba(0, 0, 0, 0)'); // Fully transparent
//             //                     fadeGradient.addColorStop(0.4, 'rgba(0, 0, 0, 0.2)'); // Light fade in
//             //                     fadeGradient.addColorStop(0.6, 'rgba(0, 0, 0, 0.2)'); // Consistent in middle
//             //                     fadeGradient.addColorStop(1, 'rgba(0, 0, 0, 0)'); // Fully transparent

//             //                     context.globalCompositeOperation = 'source-atop';
//             //                     context.fillStyle = fadeGradient;
//             //                     context.fillRect(0, 0, canvasWidth, canvasHeight);

//             //                     context.restore();

//             //                     // Finalize the shape
//             //                     context.fillStrokeShape(shape);
//             //                 },
//             //             });

//             //             // Add shape to layer
//             //             layer.add(reflectionOval);

//             //             // Redraw the layer
//             //             layer.draw();
//             //         }


//             //         drawCenteredEggShape(layer);
//             //     }

//             //     // Function to draw the purple (medium) background using Konva layer
//             //     function drawMedium(): void {
//             //         const loader = document.querySelector("#aviator-static-purple") as HTMLElement | null;
//             //         if (loader) {
//             //             loader.style.display = 'flex'; // Show the purple loader CSS
//             //             // You can also add any Konva elements to the passed layer if needed
//             //         }
//             //     }

//             //     // Function to draw the pink (large) background using Konva layer
//             //     function drawLarge(): void {
//             //         const loader = document.querySelector("#aviator-static-pink") as HTMLElement | null;
//             //         if (loader) {
//             //             loader.style.display = 'flex'; // Show the pink loader CSS
//             //             // You can also add any Konva elements to the passed layer if needed
//             //         }
//             //     }

//             //     // Remove any existing loaders or backgrounds
//             //     function removeDrawing(): void {
//             //         const loaders = ["#aviator-static-pink", "#aviator-static-blue", "#aviator-static-purple"];
//             //         loaders.forEach(loaderId => {
//             //             const loader = document.querySelector(loaderId) as HTMLElement | null;
//             //             if (loader) {
//             //                 loader.style.display = 'none'; // Hide the CSS loaders
//             //             }
//             //         });

//             //         // Remove all children from the single passed Konva layer
//             //         layer.destroyChildren();
//             //         layer.draw(); // Re-render the layer without any children
//             //     }

//             //     // Add background based on the selected size using Konva layer
//             //     switch (size) {
//             //         case 'none':
//             //             removeDrawing();
//             //             break;
//             //         case 'small':
//             //             removeDrawing(); // Remove previous background if any
//             //             drawSmall();
//             //             break;
//             //         case 'medium':
//             //             removeDrawing(); // Remove previous background if any
//             //             drawMedium();
//             //             break;
//             //         case 'large':
//             //             removeDrawing(); // Remove previous background if any
//             //             drawLarge();
//             //             break;
//             //         default:
//             //             console.error('Invalid size parameter. Use "small", "medium", or "large".');
//             //             return;
//             //     }
//             // }

//             // AnimateFlyingPlaneBackground('small', thirdLayer)

//                       // const animateMultiplier = (): void => {

//             //     let multiplier = 1.0; // Initial multiplier
//             //     let multiplierSpeed = 0;

//             //     // Create Konva Text element for the multiplier
//             //     const multiplierText = new window.Konva.Text({
//             //         text: `${multiplier.toFixed(2)}x`,
//             //         x: 0,
//             //         y: stage.height() / 2.5,
//             //         width: stage.width(),
//             //         align: 'center',
//             //         fill: '#fff',
//             //         fontSize: Math.max(20, stage.width() / 10),
//             //         draggable: true,
//             //     });

//             //     // Add multiplier text to the thirdLayer
//             //     fifthLayer.add(multiplierText);

//             //     multiplierText.moveToTop();
//             //     fifthLayer.batchDraw();

//             //     const animate = () => {
//             //         const currentMultiplier = parseFloat(multiplier.toFixed(2));

//             //         // Determine speed and background based on multiplier range
//             //         switch (true) {
//             //             case currentMultiplier < 2:
//             //                 multiplierSpeed = 0.0025;
//             //                 AnimateFlyingPlaneBackground('small', thirdLayer);
//             //                 break;
//             //             case currentMultiplier < 10:
//             //                 multiplierSpeed = 0.0035;
//             //                 AnimateFlyingPlaneBackground('medium', thirdLayer);
//             //                 break;
//             //             case currentMultiplier < 20:
//             //                 multiplierSpeed = 0.002;
//             //                 AnimateFlyingPlaneBackground('large', thirdLayer);
//             //                 break;
//             //             case currentMultiplier < 50:
//             //                 multiplierSpeed = 0.003;
//             //                 AnimateFlyingPlaneBackground('large', thirdLayer);
//             //                 break;
//             //             case currentMultiplier < 100:
//             //                 multiplierSpeed = 0.005;
//             //                 AnimateFlyingPlaneBackground('large', thirdLayer);
//             //                 break;
//             //             default:
//             //                 multiplierSpeed = 1;
//             //                 AnimateFlyingPlaneBackground('large', thirdLayer);
//             //                 break;
//             //         }

//             //         // Update multiplier value
//             //         multiplier += multiplierSpeed;
//             //         multiplierText.text(`${multiplier.toFixed(2)}x`); // Update Konva Text
//             //         fifthLayer.batchDraw(); // Redraw the layer with updated text

//             //         // Stop animation if maxMultiplier is reached
//             //         if (currentMultiplier >= maxMultiplier) {
//             //             AnimateFlyingPlaneBackground('none', thirdLayer); // Clear the background
//             //             multiplierText.destroy(); // Remove the text
//             //             fifthLayer.batchDraw(); // Redraw after removing text
//             //             AnimateFlewAwayText(maxMultiplier, thirdLayer);
//             //         } else {
//             //             requestAnimationFrame(animate); // Continue the animation
//             //         }
//             //     };

//             //     requestAnimationFrame(animate); // Start the animation
//             // };

//             // function animateFlyingPlane() {
//             //     const isflyAway = flyAwayRef.current;

//             //     const engineStartAudio = new Audio('/assets/audio/aviatortakeoff.mp3');
//             //     const flyAwayAudio = new Audio('/assets/audio/aviatorflewaway.mp3');

//             //     const runwayEnd = fourthLayer.width() * 0.12;
//             //     let floatEnd: any;
//             //     if (fourthLayer.width() < 412) {
//             //         floatEnd = fourthLayer.width() * 0.75;
//             //         velocity.current = 0.5;
//             //     } else if (fourthLayer.width() > 412) {
//             //         floatEnd = fourthLayer.width() * 0.8;
//             //     }
//             //     let hasEngineStarted = false;
//             //     let hasFlownAway = false;
//             //     let floatOffset = 0.05;
//             //     let floatAmplitude: any;
//             //     if (fourthLayer.height() > 400) {
//             //         floatAmplitude = Math.floor(Math.random() * (90 - 60 + 1)) + 60;
//             //     } else if (fourthLayer.height() < 235) {
//             //         floatAmplitude = Math.floor(Math.random() * (60 - 40 + 1)) + 40;
//             //     }

//             //     const floatSpeed = 0.015;

//             //     const tHeight = fourthLayer.height() * 0.4 - 70;
//             //     const targetHeight = fourthLayer.height() * 0.4;
//             //     console.log(`Totat width: ${fourthLayer.width()}, Run Way end: ${runwayEnd}, floatEnd: ${floatEnd}, Target Height: ${targetHeight}`)

//             //     // Given constants for fixed values
//             //     const fixedWidth = 160; 
//             //     const fixedHeight = 80;
//             //     const fixedXPosition = -15;
//             //     const fixedYPosition = 105;

//             //     // New calculated plane dimensions
//             //     const planeWidth = Math.max(80, fourthLayer.width() / 7.5);
//             //     const planeHeight = planeWidth / 2;

//             //     // Calculate scaling ratios for width and height
//             //     const widthRatio = planeWidth / fixedWidth;
//             //     const heightRatio = planeHeight / fixedHeight;

//             //     // Calculate new positions using the scaling ratios
//             //     const newXPosition = fixedXPosition * widthRatio;
//             //     const newYPosition = stage.height() - (fixedYPosition * heightRatio);

//             //     position.current.x = -15;
//             //     position.current.y = stage.height() - 105;
//             //     console.log(`Current X: ${position.current.x}, Current Y: ${position.current.y}`)
//             //     const planeImage = showPlaneGif(fourthLayer, position.current.x, position.current.y);

//             //     // const planeWidth = Math.max(80, fourthLayer.width() / 7.5);
//             //     // const planeHeight = planeWidth / 2;

//             //     // return;
//             //     // Original single line trail (sharp line)
//             //     const trailLine = new window.Konva.Path({
//             //         data: '',
//             //         stroke: '#d60c3d', // Bright red color
//             //         strokeWidth: 5,
//             //         lineCap: 'round',
//             //         lineJoin: 'round',
//             //     });
//             //     fourthLayer.add(trailLine);

//             //     // Closed trail with fill (soft glowing effect)
//             //     const trailFill = new window.Konva.Path({
//             //         data: '',
//             //         stroke: 'rgba(255, 0, 0, 0.3)', // Same transparent red for stroke and fill
//             //         strokeWidth: 1,
//             //         fill: 'rgba(255, 0, 0, 0.3)', // Transparent red fill
//             //         closed: true,
//             //     });
//             //     fourthLayer.add(trailFill);

//             //     function updateTrails(x: number, y: number) {
//             //         let linePathData = `M30,${fourthLayer.height() - 33} `;
//             //         let fillPathData = `M30,${fourthLayer.height() - 35} `;

//             //         if (x <= runwayEnd) {
//             //             // Straight line and fill for the runway
//             //             linePathData += `L${x},${fourthLayer.height() - 35} `;
//             //             fillPathData += `L${x},${fourthLayer.height() - 35} `;
//             //         } else {
//             //             // Smooth transition with a quadratic curve
//             //             const controlX = runwayEnd + (x - runwayEnd) / 2;
//             //             const controlY = fourthLayer.height() - 35; // Control point height for curve
//             //             linePathData += `Q${controlX},${controlY} ${x},${y} `;
//             //             fillPathData += `Q${controlX},${controlY} ${x},${y} `;
//             //         }

//             //         // Extend fill path to close the shape
//             //         fillPathData += `L${x},${fourthLayer.height() - 30} L30,${fourthLayer.height() - 30} Z`;

//             //         trailLine.data(linePathData); // Update sharp single line
//             //         trailFill.data(fillPathData); // Update filled shape
//             //         fourthLayer.batchDraw(); // Redraw the layer
//             //     }

//             //     function animatePlaneFlying() {
//             //         let newX = position.current.x;
//             //         let newY = position.current.y;
//             //         let trailnewX = trailposition.current.x;
//             //         let trailnewY = trailposition.current.y;

//             //         if (flyAwayRef.current) {
//             //             if (!hasFlownAway && musicRef.current) {
//             //                 engineStartAudio.pause();
//             //                 flyAwayAudio.play();
//             //                 hasFlownAway = true;
//             //             }

//             //             velocity.current = 10;
//             //             newX += velocity.current;
//             //             trailnewX += velocity.current;

//             //             if (newX > fourthLayer.width()) {
//             //                 fourthLayer.destroy(); // Destroy the layer after the plane leaves the screen
//             //                 console.log("Plane has flown away and fourthLayer is destroyed.");
//             //             }
//             //         } else {
//             //             if (!hasEngineStarted && musicRef.current && eventRef.current && newX <= 10) {
//             //                 engineStartAudio.play();
//             //                 hasEngineStarted = true;
//             //             }

//             //             newX += velocity.current;
//             //             trailnewX += velocity.current;

//             //             // Handle runway end to float transition
//             //             if (newX <= runwayEnd) {
//             //                 newY = fourthLayer.height() - 105;
//             //                 trailnewY = fourthLayer.height() - 35;
//             //             } else if (newX <= floatEnd) {
//             //                 // Smooth transition from runway to floatEnd
//             //                 const trailprogress = (trailnewX - runwayEnd) / (floatEnd - runwayEnd);
//             //                 const progress = (newX - runwayEnd) / (floatEnd - runwayEnd);
//             //                 newY = (fourthLayer.height() - 105) - progress * ((fourthLayer.height() - 105) - tHeight);
//             //                 trailnewY = (fourthLayer.height() - 35) - trailprogress * ((fourthLayer.height() - 35) - targetHeight);

//             //             } else {
//             //                 // Stop horizontal movement when reaching floatEnd
//             //                 newX = floatEnd; // Lock newX at floatEnd once it is reached
//             //                 trailnewX = floatEnd + 15;
//             //                 // Floating effect: sinusoidal oscillation on the vertical axis
//             //                 newY = tHeight + Math.sin(floatOffset) * floatAmplitude;
//             //                 trailnewY = targetHeight + Math.sin(floatOffset) * floatAmplitude;
//             //                 // console.log(`NewY; ${newY}`);
//             //                 floatOffset += floatSpeed; // Update offset for next frame
//             //                 // console.log(`FloatOffset: ${floatOffset}`);
//             //             }
//             //         }

//             //         // Update position of plane
//             //         position.current = { x: newX, y: newY };
//             //         trailposition.current = { x: trailnewX, y: trailnewY }
//             //         planeImage.position({ x: newX, y: newY });
//             //         // planeImage.size({ width: planeWidth, height: planeHeight });
//             //         updateTrails(trailnewX, trailnewY); // Update trails
//             //         fourthLayer.batchDraw(); // Redraw the layer
//             //         requestAnimationFrame(animatePlaneFlying);
//             //     }

//             //     animatePlaneFlying(); // Start the animation

//             //     return () => {
//             //         engineStartAudio.pause();
//             //         flyAwayAudio.pause();
//             //         planeImage.destroy();
//             //         trailLine.destroy();
//             //         trailFill.destroy();
//             //         fourthLayer.batchDraw();
//             //     };
//             // }
//     return (
//         <div className="aviator-game-canva">
//             <img id="plane" src="assets/images/plane.png"
//                 style={{ position: "absolute", left: "35px", bottom: "35px", width: "120px", height: "60px" }} alt="plane" />
//             <canvas id="aviatorCanvas"></canvas>
//             <div id="multiplier" className="multiplier"></div>
//             <div id="aviator-static-plane" className="aviator-static-plane">
//                 <img id="aviator-static-plane" src="assets/images/plane.png" alt="Aviator Plane" />
//             </div>
//             <div id="aviator-static-loader" className="aviator-static-loader">
//                 <img id="aviator-static-loader" src="assets/images/loader.gif" alt="Aviator Loader" />
//             </div>
//             <div id="aviator-static-blue" className="exact-gradient-blue"></div>
//             <div id="aviator-static-purple" className="exact-gradient-purple"></div>
//             <div id="aviator-static-pink" className="exact-gradient-pink"></div>
//         </div>
//     )
// }