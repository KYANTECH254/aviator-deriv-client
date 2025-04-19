"use client";
import { useState, useRef, useEffect } from 'react';
import './main.css';
import { useSession } from '@/context/SessionProvider';
import useUserInteraction from '@/hooks/useUserInteraction';
import { useSettings } from '@/context/SettingsContext';

export default function Main() {
    const { multiplier, maxMultiplier, crashed } = useSession();
    const { isSoundEnabled, isAnimationEnabled } = useSettings();
    const { eventTriggered } = useUserInteraction();

    const multiplierRef = useRef<HTMLDivElement>(null);
    const milestoneRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>();
    const flewAwayAudioRef = useRef<HTMLAudioElement | null>(null);
    const engineAudioRef = useRef<HTMLAudioElement | null>(null);

    const [prevCrashState, setPrevCrashState] = useState<string | null>(null);
    const [showFlyAway, setShowFlyAway] = useState(false);
    const [isWaiting, setIsWaiting] = useState(false);
    const [showPlane, setShowPlane] = useState(false);
    const [showLoader, setShowLoader] = useState(false);
    const [roundStarted, setRoundStarted] = useState(false)
    const [hasPlayedTakeoff, setHasPlayedTakeoff] = useState(false);

    useEffect(() => {
        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (multiplierRef.current) {
            multiplierRef.current.textContent = `${parseFloat(multiplier).toFixed(2)}x`;
        }
        updateMilestone(parseFloat(multiplier));
    }, [multiplier]);

    useEffect(() => {
        if (crashed && crashed !== prevCrashState) {
            setPrevCrashState(crashed);

            if (isSoundEnabled) {
                if (!flewAwayAudioRef.current) {
                    flewAwayAudioRef.current = new Audio('/assets/audio/aviatorflewaway.mp3');
                }
                if (!engineAudioRef.current) {
                    engineAudioRef.current = new Audio('/assets/audio/aviatortakeoff.mp3');
                }

                if (crashed === "true" && eventTriggered) {
                    engineAudioRef.current.pause();
                    flewAwayAudioRef.current.currentTime = 0;
                    flewAwayAudioRef.current.play().catch(err => {
                        console.warn("Flew away audio play error:", err);
                    });
                    setHasPlayedTakeoff(false);
                } else if (crashed === "false" && eventTriggered && !hasPlayedTakeoff) {
                    flewAwayAudioRef.current.pause();
                    engineAudioRef.current.currentTime = 0;
                    engineAudioRef.current.play().catch(err => {
                        console.warn("Engine audio play error:", err);
                    });

                    setHasPlayedTakeoff(true);
                }
            }

            if (crashed === "true" && maxMultiplier) {
                handleCrashSequence(parseFloat(maxMultiplier));
            } else if (crashed === "false") {
                startNewRound();
            }
        }
    }, [crashed, maxMultiplier, isSoundEnabled, eventTriggered, hasPlayedTakeoff]);

    function handleCrashSequence(finalMultiplier: number) {
        if (!milestoneRef.current) return;
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }
        milestoneRef.current.setAttribute('data-state', 'flewAway');
        setRoundStarted(false)
        setShowFlyAway(true);
        setShowPlane(false);
        setShowLoader(false);
        setIsWaiting(false);

        setTimeout(() => {
            setShowFlyAway(false);
            AnimateWaitingForBets();
        }, 2000);
    }

    function startNewRound() {
        if (!milestoneRef.current) return;
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }

        milestoneRef.current.setAttribute('data-state', 'flying');
        setRoundStarted(true)
        setIsWaiting(false);
        setShowPlane(false);
        setShowLoader(false);
    }

    function updateMilestone(current: number) {
        if (!milestoneRef.current) return;
        const milestone = current < 2 ? '1' : current < 10 ? '2' : '3';
        milestoneRef.current.setAttribute('data-milestone', milestone);
    }

    function AnimateWaitingForBets() {
        if (!milestoneRef.current) return;

        setIsWaiting(true);
        setShowPlane(true);
        setShowLoader(true);
        milestoneRef.current.setAttribute('data-state', 'loading');

        const startTime = performance.now();
        const duration = 5000;
        const fullWidth = 150;

        const drawFrame = () => {
            const elapsed = performance.now() - startTime;
            if (elapsed < duration) {
                animationRef.current = requestAnimationFrame(drawFrame);
            } else {
                setIsWaiting(false);
                setShowPlane(false);
                setShowLoader(false);
            }
        };
        animationRef.current = requestAnimationFrame(drawFrame);
    }


    return (
        <div className="aviator gameD" data-state="flying" ref={milestoneRef}>
            <div className="light-canvas">

                {isAnimationEnabled ? (
                    <div className="bg-sun"></div>
                ) : (
                    <div className="stop-bg-sun"></div>
                )}
                {roundStarted && (
                    <>
                        <div className="contrail"></div>
                        {isAnimationEnabled && (
                            <>
                                <div className="dotsT dotsHorizontal"></div>
                                <div className="dotsT dotsVertical"></div>
                            </>
                        )}
                        <div className="lighting" style={{ zIndex: 1 }}></div>
                    </>
                )}

                {showFlyAway && (
                    <>
                        <div className="contrail"></div>
                        <div className="dotsT dotsHorizontal"></div>
                        <div className="dotsT dotsVertical"></div>
                    </>
                )}

                {!showFlyAway && !isWaiting && roundStarted && (
                    <div className="score" style={{ zIndex: 2 }}>
                        <div className="valueS" ref={multiplierRef}>
                            {parseFloat(multiplier).toFixed(2)}x
                        </div>
                    </div>
                )}

                {showFlyAway && !isWaiting && (
                    <div className="score" style={{ zIndex: 3 }}>
                        <div className="messageG">Flew away!</div>
                        <div className="valueS">
                            {parseFloat(maxMultiplier)?.toFixed(2)}x
                        </div>
                    </div>
                )}

                {isWaiting && (
                    <div className="waiting-wrapper">
                        <p className="waiting-text">WAITING FOR NEXT ROUND</p>
                        <div className="loader-background">
                            <div className="loader-progress" id="loaderProgress"></div>
                        </div>
                    </div>

                )}

                {showPlane && (
                    <div className="light-plane" style={{ zIndex: 5 }}></div>
                )}

                {showLoader && (
                    <div className="aviator-static-loader" style={{ zIndex: 5 }}>
                        <img src="assets/images/loader.gif" alt="Loading" />
                    </div>
                )}
            </div>
        </div>
    );
}