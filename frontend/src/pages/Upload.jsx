import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useResume } from '../context/ResumeContext';
import Navbar from '../components/Navbar';
import FileUploader from '../components/FileUploader';

const Upload = () => {
    const navigate = useNavigate();
    const { user } = useUser();
    const { upload, isUploading, uploadProgress, uploadStatus } = useResume();

    const [isProcessing, setIsProcessing] = useState(false);
    const [statusText, setStatusText] = useState('');
    const [file, setFile] = useState(null);

    const handleFileSelect = (selectedFile) => {
        setFile(selectedFile);
    };

    // Function to reset the form to its initial state
    const resetForm = () => {
        setIsProcessing(false);
        setFile(null);
        setStatusText('');
        // This clears the text fields in the form
        if (document.getElementById('upload-form')) {
            document.getElementById('upload-form').reset();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        if (!form || !file) {
            setStatusText('Error: Please select a resume file.');
            return;
        }

        if (!user || !user._id) {
            setStatusText('Error: User not found. Please log in again.');
            navigate('/login');
            return;
        }

        const companyName = form.elements['company-name'].value;
        const jobTitle = form.elements['job-title'].value;
        const jobDescription = form.elements['job-description'].value;

        setIsProcessing(true);
        setStatusText('Uploading resume...');

        try {
            const payload = { companyName, jobTitle, jobDescription, file };
            const result = await upload(payload);
            
            console.log('Upload result:', result);
            setStatusText('Analysis complete, redirecting...');

            // ⭐ FIX #1: Check for result.id, which matches what the backend sends.
            const uuid = result?._id;
            
            if (uuid) {
                // Navigate to the resume page
                navigate(`/resume/${uuid}`);
                // It's good practice to reset the form after successful navigation
                resetForm();
            } else {
                setStatusText('Upload succeeded but no analysis ID was returned. Please check the console.');
                // ⭐ FIX #2: Reset the processing state on failure to re-enable the form.
                setIsProcessing(false);
            }
        } catch (err) {
            console.error("Upload failed:", err);
            setStatusText(`Error: ${err.message}`);
            // ⭐ FIX #3: Also reset the processing state on error.
            setIsProcessing(false);
        }
    };

    useEffect(() => {
        if (isUploading) {
            setStatusText(uploadStatus || 'Uploading...');
        } else if (uploadProgress > 0 && uploadProgress < 100) {
            setStatusText(`Upload is ${uploadProgress}% complete`);
        } else if (!isUploading && uploadProgress === 100 && isProcessing) {
            // Check for isProcessing to avoid this message showing up incorrectly
            setStatusText('Finalizing and processing...');
        }
    }, [isUploading, uploadProgress, uploadStatus, isProcessing]);

    return (
        <main className="bg-gray-100 min-h-screen font-sans antialiased">
            <Navbar />
            <section className="container mx-auto p-4 md:p-8">
                <div className="bg-white rounded-xl shadow-lg p-6 md:p-10 text-center">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-2">Smart feedback for your dream job</h1>
                    
                    {isProcessing || isUploading ? (
                        <>
                            <h2 className="text-xl md:text-2xl font-semibold text-gray-600 mb-6">{statusText}</h2>
                            <div className="w-full max-w-lg mx-auto mt-4">
                                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                    <div
                                        style={{ width: `${uploadProgress}%` }}
                                        className="h-3 transition-all duration-300 bg-gradient-to-r from-indigo-500 to-indigo-300"
                                    />
                                </div>
                                <p className="text-sm text-gray-500 mt-2">{uploadStatus}</p>
                            </div>
                        </>
                    ) : (
                        <>
                            <h2 className="text-xl md:text-2xl font-semibold text-gray-600 mb-6">Drop your resume for an ATS score and improvement tips</h2>
                            {statusText && <p className="text-red-500 font-bold mt-4">{statusText}</p>}
                        </>
                    )}

                    {!isProcessing && !isUploading && (
                        <form id="upload-form" onSubmit={handleSubmit} className="flex flex-col gap-6 mt-8 max-w-xl mx-auto">
                             <div className="form-div text-left">
                                <label htmlFor="company-name" className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                                <input type="text" name="company-name" placeholder="E.g., Google" id="company-name" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2" />
                            </div>

                            <div className="form-div text-left">
                                <label htmlFor="job-title" className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                                <input type="text" name="job-title" placeholder="E.g., Software Engineer" id="job-title" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2" />
                            </div>

                            <div className="form-div text-left">
                                <label htmlFor="job-description" className="block text-sm font-medium text-gray-700 mb-1">Job Description</label>
                                <textarea rows={5} name="job-description" placeholder="Paste the job description here..." id="job-description" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2" />
                            </div>

                            <div className="form-div text-left">
                                <label htmlFor="uploader" className="block text-sm font-medium text-gray-700 mb-1">Upload Resume (PDF)</label>
                                <FileUploader onFileSelect={handleFileSelect} />
                                {file && <p className="text-sm text-gray-600 mt-2">Selected: {file.name}</p>}
                            </div>

                            <button className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-150 ease-in-out disabled:opacity-50" type="submit" disabled={isProcessing || isUploading || !file}>
                                Analyze My Resume
                            </button>
                        </form>
                    )}
                </div>
            </section>
        </main>
    );
};

export default Upload;