import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import ResumeCard from '../components/ResumeCard';
import { useResume } from '../context/ResumeContext';
// ⭐ STEP 1: Import the mock data again.
// Make sure this path is correct for your project structure.
import { resumes as mockResumes } from '../lib/constants';

const Home = () => {
    const { userResumes = [], loadingResumes = false, error = null, fetchUserResumes } = useResume() || {};

    const [activeIndex, setActiveIndex] = useState(null);
    const [middleIndex, setMiddleIndex] = useState(null);

    // ⭐ STEP 2: Determine which set of resumes to display.
    // If the user has uploaded their own resumes, use those. Otherwise, fall back to the mock data.
    const resumesToDisplay = userResumes.length > 0 ? userResumes : mockResumes;

    useEffect(() => {
        // This effect now correctly works with whichever list is being displayed.
        if (resumesToDisplay.length > 0) {
            const mid = Math.floor(resumesToDisplay.length / 2);
            setMiddleIndex(mid);
            setActiveIndex(mid);
        } else {
            setMiddleIndex(null);
            setActiveIndex(null);
        }
    }, [resumesToDisplay]); // Depend on the list that is actually being rendered.

    const handleRetry = () => {
        if (fetchUserResumes) {
            fetchUserResumes();
        }
    };

    return (
        <main className="bg-gray-200 min-h-screen">
            <Navbar />
            <section className="container mx-auto p-4">
                <div className="text-center py-8">
                    <h1 className="text-4xl font-bold text-gray-800">Track Your Applications & Resume Ratings</h1>
                    <h2 className="mt-2 text-xl text-gray-600">
                        Review your submissions and check AI-powered feedback.
                    </h2>
                </div>

                {loadingResumes && (
                    <div className="flex justify-center mt-10">
                        <div className="w-16 h-16 border-4 border-gray-900 border-t-transparent rounded-full animate-spin" />
                    </div>
                )}

                {!loadingResumes && error && (
                    <div className="text-center text-red-500 mt-10 p-6 bg-red-50 rounded-lg">
                        <p className="font-semibold">An error occurred:</p>
                        <p className="mb-4">{error}</p>
                        <button
                            onClick={handleRetry}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* ⭐ STEP 3: Update the rendering logic. */}
                {/* This block now renders the chosen list (either real or mock data). */}
                {!loadingResumes && !error && resumesToDisplay.length > 0 && (
                    <>
                        {/* Show a helpful message if the mock data is being used */}
                        {userResumes.length === 0 && (
                            <p className="text-center text-gray-500 mt-4">
                                This is a preview. Sign in and upload a resume to see your personalized feedback!
                            </p>
                        )}
                        <div className="resumes-section grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
                            {resumesToDisplay.map((resume, idx) => (
                                <ResumeCard
                                    key={resume._id || resume.id || `resume-${idx}`} // Use a fallback key for mock data
                                    resume={resume}
                                    index={idx}
                                    isActive={activeIndex === idx}
                                    onMouseEnter={() => setActiveIndex(idx)}
                                    onMouseLeave={() => setActiveIndex(middleIndex)}
                                    onFocus={() => setActiveIndex(idx)}
                                    onBlur={() => setActiveIndex(middleIndex)}
                                />
                            ))}
                        </div>
                    </>
                )}
            </section>
        </main>
    );
};

export default Home;