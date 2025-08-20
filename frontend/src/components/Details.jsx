// File: components/Details.jsx
import React, { createContext, useContext, useState } from 'react';
import { Accordion, AccordionItem, AccordionHeader, AccordionContent } from './Accordion'; // Corrected import path
import { cn } from '../lib/utils'; // Corrected import path

// Component for a small, colored score badge with an icon
const ScoreBadgeAlt = ({ score }) => {
    const getColorClass = (s) => {
        if (s > 69) return 'bg-green-100 text-green-800';
        if (s > 39) return 'bg-yellow-100 text-yellow-800';
        return 'bg-red-100 text-red-800';
    };

    return (
        <div className={`flex flex-row gap-1 items-center px-2 py-0.5 rounded-full ${getColorClass(score)}`}>
            {/* Inline SVG for icons to avoid external image dependencies */}
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                {score > 69 ? (
                    <>
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-8.84"></path>
                        <path d="M22 4L12 14.01l-3-3"></path>
                    </>
                ) : (
                    <>
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </>
                )}
            </svg>
            <p className={`text-sm font-medium`}>
                {score}/100
            </p>
        </div>
    );
};

// Component for a header in an accordion item
const CategoryHeader = ({ title, categoryScore }) => {
    return (
        <div className="flex flex-row gap-4 items-center py-2">
            <p className="text-xl font-semibold text-gray-800">{title}</p>
            <ScoreBadgeAlt score={categoryScore} />
        </div>
    );
};

// Component to display the tips for each category
const CategoryContent = ({ tips }) => {
    return (
        <div className="flex flex-col gap-4 w-full">
            <div className="bg-white p-4 rounded-lg shadow-inner">
                <ul className="list-none space-y-3">
                    {tips.map((tip, index) => (
                        <li key={index} className="flex items-start gap-3">
                            <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${tip.type === 'good' ? 'bg-green-200' : 'bg-yellow-200'}`}>
                                {/* Inline SVG for check and warning icons */}
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${tip.type === 'good' ? 'text-green-700' : 'text-yellow-700'}`}>
                                    {tip.type === 'good' ? (
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
                            <div className="flex-1">
                                <p className="text-base text-gray-700">{tip.tip}</p>
                                <p className="text-sm text-gray-500 mt-1">{tip.explanation}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

// Main component to render the detailed feedback sections with accordions
const Details = ({ feedback }) => {
    return (
        <div className="flex flex-col gap-4 w-full bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Detailed Feedback</h2>
            <Accordion>
                <AccordionItem id="tone-style">
                    <AccordionHeader itemId="tone-style">
                        <CategoryHeader title="Tone & Style" categoryScore={feedback.toneAndStyle.score} />
                    </AccordionHeader>
                    <AccordionContent itemId="tone-style">
                        <CategoryContent tips={feedback.toneAndStyle.tips} />
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem id="content">
                    <AccordionHeader itemId="content">
                        <CategoryHeader title="Content" categoryScore={feedback.content.score} />
                    </AccordionHeader>
                    <AccordionContent itemId="content">
                        <CategoryContent tips={feedback.content.tips} />
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem id="structure">
                    <AccordionHeader itemId="structure">
                        <CategoryHeader title="Structure" categoryScore={feedback.structure.score} />
                    </AccordionHeader>
                    <AccordionContent itemId="structure">
                        <CategoryContent tips={feedback.structure.tips} />
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem id="skills">
                    <AccordionHeader itemId="skills">
                        <CategoryHeader title="Skills" categoryScore={feedback.skills.score} />
                    </AccordionHeader>
                    <AccordionContent itemId="skills">
                        <CategoryContent tips={feedback.skills.tips} />
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
};

export default Details;
