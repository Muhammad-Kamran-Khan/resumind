// File: components/ATS.jsx
import React from 'react'
import { cn } from '../lib/utils'; // Added import for cn

const ATS = ({ score, suggestions }) => {
    // Determine background gradient and icon color based on score
    const gradientClass = score > 69 ?
        'from-green-100' :
        score > 49 ?
        'from-yellow-100' :
        'from-red-100';

    const iconColorClass = score > 69 ?
        'text-green-700' :
        score > 49 ?
        'text-yellow-700' :
        'text-red-700';

    // Determine subtitle based on score
    const subtitle = score > 69 ?
        'Great Job!' :
        score > 49 ?
        'Good Start' :
        'Needs Improvement';

    return (
        <div className={`bg-gradient-to-b ${gradientClass} to-white rounded-2xl shadow-md w-full p-6`}>
            {/* Top section with icon and headline */}
            <div className="flex items-center gap-4 mb-6">
                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${score > 69 ? 'bg-green-200' : score > 49 ? 'bg-yellow-200' : 'bg-red-200'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${iconColorClass}`}>
                        <path d="M14.5 10H7" />
                        <path d="M14.5 14H7" />
                        <path d="M14.5 18H7" />
                        <path d="M17 12l4 4-4 4" />
                        <path d="M21 16H3" />
                    </svg>
                </div>
                <div>
                    <h2 className="text-2xl font-bold">ATS Score - {score}/100</h2>
                </div>
            </div>

            {/* Description section */}
            <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">{subtitle}</h3>
                <p className="text-gray-600 mb-4">
                    This score represents how well your resume is likely to perform in Applicant Tracking Systems used by employers.
                </p>

                {/* Suggestions list */}
                <div className="space-y-3">
                    {suggestions.map((suggestion, index) => (
                        <div key={index} className="flex items-start gap-3">
                            <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${suggestion.type === "good" ? 'bg-green-200' : 'bg-yellow-200'}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${suggestion.type === "good" ? 'text-green-700' : 'text-yellow-700'}`}>
                                    {suggestion.type === "good" ? (
                                        <path d="M20 6L9 17l-5-5" />
                                    ) : (
                                        <>
                                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                            <line x1="12" y1="9" x2="12" y2="13" />
                                            <line x1="12" y1="17" x2="12.01" y2="17" />
                                        </>
                                    )}
                                </svg>
                            </div>
                            <p className={suggestion.type === "good" ? "text-green-700" : "text-amber-700"}>
                                {suggestion.tip}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Closing encouragement */}
            <p className="text-gray-700 italic">
                Keep refining your resume to improve your chances of getting past ATS filters and into the hands of recruiters.
            </p>
        </div>
    )
}

export default ATS;
