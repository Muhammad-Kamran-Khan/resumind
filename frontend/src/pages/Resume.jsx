import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useResume } from "../context/ResumeContext";
import Summary from "../components/Summary";
import ATS from "../components/ATS";
import Details from "../components/Details";

const Resume = () => {
  const navigate = useNavigate();
  const { feedback, jobTitle, isLoading, error } = useResume() || {};

  useEffect(() => {
    if (error && typeof error === "string" && error.toLowerCase().includes("not authorized")) {
        navigate("/login");
    }
  }, [error, navigate]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-xl text-center">
          <div className="w-24 h-24 mb-4 border-t-4 border-b-4 border-gray-900 rounded-full animate-spin" />
          <p className="mt-4 text-xl font-medium text-gray-800">Analyzing your resume for...</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{jobTitle}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
          <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-xl text-center max-w-md">
              <h2 className="mt-4 text-2xl font-bold text-red-700">An Error Occurred</h2>
              <p className="mt-2 text-gray-600">{error}</p>
              <button onClick={() => navigate("/")} className="mt-6 px-6 py-2 text-sm font-semibold text-white bg-red-600 rounded-md hover:bg-red-700">
                  Return to Homepage
              </button>
          </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="py-4">
          <button onClick={() => navigate("/")} className="back-button p-2 inline-flex items-center space-x-2 rounded-md hover:bg-gray-200 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="text-gray-800 text-sm font-semibold">Back to Homepage</span>
          </button>
        </nav>

        {/* The main layout is now a single column. */}
        <div className="flex flex-col gap-8 mt-4">
            {!feedback ? (
              <div className="text-center py-10">
                <p className="text-gray-500">No feedback available for this resume.</p>
              </div>
            ) : (
              <>
                <section>
                  <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6 text-center">
                    Resume Review for: {jobTitle}
                  </h2>
                  <Summary feedback={feedback} />
                </section>
                <section>
                  <ATS score={feedback.ATS?.score || 0} suggestions={feedback.ATS?.tips || []} />
                </section>
                <section>
                  <Details feedback={feedback} />
                </section>
              </>
            )}
        </div>
      </div>
    </main>
  );
};

export default Resume;