// File: components/Summary.jsx
import React from 'react';
import ScoreGauge from "./ScoreGauge";
import ScoreBadge from "./ScoreBadge";

const Category = ({ title, score }) => {
    const textColor = score > 70 ? 'text-green-600' : score > 49 ? 'text-yellow-600' : 'text-red-600';

    return (
        <div className="p-4 border-b border-gray-200 last:border-b-0">
            <div className="flex justify-between items-center">
                <div className="flex flex-row gap-2 items-center">
                    <p className="text-lg font-semibold">{title}</p>
                    <ScoreBadge score={score} />
                </div>
                <p className="text-lg font-bold">
                    <span className={textColor}>{score}</span>/100
                </p>
            </div>
        </div>
    );
};


const Summary = ({ feedback }) => {
    if (!feedback) return null;

    return (
        <div className="bg-white rounded-2xl shadow-lg w-full">
            <div className="flex items-center p-6 gap-8 border-b border-gray-200">
                <ScoreGauge score={feedback.overallScore} />

                <div className="flex flex-col gap-2">
                    <h2 className="text-2xl font-bold text-gray-900">Your Resume Score</h2>
                    <p className="text-sm text-gray-500">This score is calculated based on the variables listed below.</p>
                </div>
            </div>

            <Category title="Tone & Style" score={feedback.toneAndStyle.score} />
            <Category title="Content" score={feedback.content.score} />
            <Category title="Structure" score={feedback.structure.score} />
            <Category title="Skills" score={feedback.skills.score} />
        </div>
    );
};

export default Summary;
