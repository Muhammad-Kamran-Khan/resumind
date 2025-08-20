// File: components/ScoreGauge.jsx
import React, { useEffect, useRef, useState } from 'react';

const ScoreGauge = ({ score = 75 }) => {
    const [pathLength, setPathLength] = useState(0);
    const pathRef = useRef(null);
    const percentage = Math.max(0, Math.min(1, score / 100));

    useEffect(() => {
        if (pathRef.current && typeof pathRef.current.getTotalLength === 'function') {
            setPathLength(pathRef.current.getTotalLength());
        }
    }, [pathRef]);

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-40 h-20">
                <svg viewBox="0 0 100 50" className="w-full h-full">
                    <defs>
                        {/* Corrected linear gradient to match the colors of the badges */}
                        <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#ef4444" />
                            <stop offset="50%" stopColor="#facc15" />
                            <stop offset="100%" stopColor="#22c55e" />
                        </linearGradient>
                    </defs>

                    <path d="M10,50 A40,40 0 0,1 90,50" fill="none" stroke="#e5e7eb" strokeWidth="10" strokeLinecap="round" />

                    <path
                        ref={pathRef}
                        d="M10,50 A40,40 0 0,1 90,50"
                        fill="none"
                        stroke="url(#gaugeGradient)"
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray={pathLength}
                        strokeDashoffset={pathLength * (1 - percentage)}
                    />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
                    <div className="text-xl font-semibold pt-4">{score}/100</div>
                </div>
            </div>
        </div>
    );
};

export default ScoreGauge;
