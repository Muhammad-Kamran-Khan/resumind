import React, { createContext, useState, useCallback, useEffect, useContext } from 'react';
import { useMatch } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useUser } from './UserContext';
// Import the mock data to use as a fallback
import { resumes as mockResumes } from '../lib/constants';

const ResumeContext = createContext();
export const useResume = () => useContext(ResumeContext);

export const ResumeProvider = ({ children }) => {
    const match = useMatch('/resume/:uuid');
    const id = match?.params?.uuid || null;
    const { user } = useUser();

    const [feedback, setFeedback] = useState(null);
    const [jobTitle, setJobTitle] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pdfUrl, setPdfUrl] = useState(null);
    const [currentAnalysisId, setCurrentAnalysisId] = useState(null);

    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadError, setUploadError] = useState(null);
    const [uploadStatus, setUploadStatus] = useState('');

    const [userResumes, setUserResumes] = useState([]);
    const [loadingResumes, setLoadingResumes] = useState(false);

    const safeParseFeedback = (maybe) => {
        if (!maybe) return null;
        if (typeof maybe === 'object') return maybe;
        if (typeof maybe === 'string') {
            try { return JSON.parse(maybe); }
            catch { return { raw: maybe }; }
        }
        return { raw: String(maybe) };
    };

    const fetchFeedback = useCallback(async (signal) => {
        // ⭐ THE FIX IS HERE ⭐
        // Check if the ID from the URL belongs to a mock resume.
        if (id && id.startsWith('mock-')) {
            console.log(`Loading mock resume data for ID: ${id}`);
            const mockData = mockResumes.find(r => r.id === id);
            if (mockData) {
                setFeedback(mockData.feedback);
                setJobTitle(mockData.jobTitle);
                setPdfUrl(mockData.pdfUrl);
                setCurrentAnalysisId(id);
            } else {
                setError(`Mock resume with ID "${id}" not found.`);
            }
            return;
        }

        if (id && id === currentAnalysisId) {
            return; // Data is already loaded for a real resume
        }
        if (!id) {
            setFeedback(null); setJobTitle(''); setPdfUrl(null); setCurrentAnalysisId(null);
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.get(`/resume/${id}`, { signal });
            const data = response.data || {};
            setFeedback(safeParseFeedback(data.feedback));
            setJobTitle(data.jobTitle || '');
            setPdfUrl(data.pdfUrl || null);
            setCurrentAnalysisId(id);
        } catch (err) {
            if (!axios.isCancel(err)) {
                setError(err?.response?.data?.error || err.message || 'Failed to fetch feedback');
            }
        } finally {
            setIsLoading(false);
        }
    }, [id, currentAnalysisId]);

    // ... (the rest of the file remains the same)
    const fetchUserResumes = useCallback(async () => {
        if (!user?._id) {
            setUserResumes([]);
            return;
        }
        setLoadingResumes(true);
        setError(null);
        try {
            const response = await axios.get(`/resumes/${user._id}`);
            setUserResumes(response.data || []);
        } catch (err) {
            setError('Failed to load your resumes.');
            setUserResumes([]);
        } finally {
            setLoadingResumes(false);
        }
    }, [user?._id]);

    useEffect(() => {
        const controller = new AbortController();
        fetchFeedback(controller.signal);
        return () => controller.abort();
    }, [id, fetchFeedback]);

    useEffect(() => {
        fetchUserResumes();
    }, [fetchUserResumes]);

    const upload = useCallback(async (payload) => {
        setIsUploading(true);
        setUploadError(null);
        setUploadProgress(0);
        setUploadStatus('Uploading...');
        const formData = new FormData();
        if (payload.companyName) formData.append('companyName', payload.companyName);
        if (payload.jobTitle) formData.append('jobTitle', payload.jobTitle);
        if (payload.jobDescription) formData.append('jobDescription', payload.jobDescription);
        if (payload.file) formData.append('resume', payload.file);

        try {
            const response = await axios.post(`/upload`, formData, {
                onUploadProgress: (ev) => { if (ev.total) setUploadProgress(Math.round((ev.loaded * 100) / ev.total)); },
                timeout: 120000,
            });

            const data = response.data || {};
            toast.success('Resume uploaded and analyzed!');

            setFeedback(safeParseFeedback(data.feedback));
            setJobTitle(data.jobTitle || '');
            setPdfUrl(data.pdfUrl || null);
            setCurrentAnalysisId(data.id || null);
            
            setUserResumes(prevResumes => [data, ...prevResumes]);
            
            return data;
        } catch (err) {
            const msg = err?.response?.data?.error || err?.message || 'Upload failed';
            setUploadError(msg);
            setUploadStatus('Upload failed');
            toast.error(msg);
            throw new Error(msg);
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    }, []);

    const value = {
        feedback, jobTitle, isLoading, error, pdfUrl,
        refresh: fetchFeedback,
        upload, isUploading, uploadProgress, uploadError, uploadStatus,
        userResumes, loadingResumes, fetchUserResumes,
    };

    return <ResumeContext.Provider value={value}>{children}</ResumeContext.Provider>;
};