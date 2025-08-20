import React from 'react';
import { Link } from 'react-router-dom';
import ScoreCircle from './ScoreCircle';

const ResumeCard = ({ resume, index, isActive, onMouseEnter, onMouseLeave, onFocus, onBlur }) => {
    // Destructure all possible properties from the resume object
    const { _id, id, companyName, jobTitle, previewUrl, resumePath, feedback } = resume;

    // Determine the correct image source. Prioritize `previewUrl` from real data,
    // but fall back to `resumePath` from mock data if it's not available.
    const imageSource = previewUrl || resumePath;

    // Use the database _id for the link if it exists, otherwise fall back to the mock id.
    const linkId = _id || id;

    const baseClasses = 'resume-card bg-white p-4 rounded-xl shadow-md transition-all duration-300 transform relative flex flex-col';
    const activeClasses = 'scale-105 shadow-xl z-20';
    const inactiveClasses = 'scale-100 hover:shadow-lg z-10';

    return (
        <Link
            to={`/resume/${linkId}`}
            className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onFocus={onFocus}
            onBlur={onBlur}
            tabIndex={0}
        >
            {/* Header Section */}
            <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0 pr-2">
                    <h2 className="text-lg font-bold text-gray-800 truncate" title={companyName || 'General Resume'}>
                        {companyName || 'General Resume'}
                    </h2>
                    {jobTitle && (
                        <h3 className="text-sm text-gray-500 truncate" title={jobTitle}>
                            {jobTitle}
                        </h3>
                    )}
                </div>
                <div className="flex-shrink-0">
                    <ScoreCircle score={feedback?.overallScore || 0} />
                </div>
            </div>

            {/* Image Preview Section */}
            <div className="flex-grow flex items-center justify-center bg-gray-50 rounded-lg overflow-hidden border">
                {imageSource ? (
                    <img
                        src={imageSource}
                        alt={`Preview for ${jobTitle || 'resume'}`}
                        className="w-full h-full object-cover object-top"
                    />
                ) : (
                    <div className="text-center p-4 text-gray-400">
                        <p>No preview available</p>
                    </div>
                )}
            </div>
        </Link>
    );
};

export default ResumeCard;