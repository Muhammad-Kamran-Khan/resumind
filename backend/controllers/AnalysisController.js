import pdf from 'pdf-parse';
import { prepareInstructions } from '../utils/analysisUtils.js';
import { callGeminiWithRetry } from '../services/gemini.js';
import Analysis from '../models/Analysis.js';
import User from '../models/User.js';
import cloudinary from '../config/cloudinary.js';
import streamifier from 'streamifier'; // Import the new helper

export const handleResumeUpload = async (req, res) => {
    console.log('--- Backend: Received request (in-memory) ---');

    if (!req.file || !req.file.buffer) {
        return res.status(400).json({ error: 'No resume file uploaded.' });
    }

    const userId = req.user?._id;
    if (!userId) {
        return res.status(401).json({ error: 'User not authenticated.' });
    }

    const { jobTitle, jobDescription, companyName } = req.body;

    if (!jobTitle) {
        return res.status(400).json({ error: 'Job title is required.' });
    }

    try {
        // 1. Upload the file buffer from memory directly to Cloudinary
        const uploadResult = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    resource_type: 'auto',
                    folder: 'resumes',
                },
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                }
            );
            // Use streamifier to create a readable stream from the buffer in memory
            streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
        });

        if (!uploadResult) {
            throw new Error('Cloudinary upload returned no result.');
        }

        // 2. Generate the correct URLs using the official Cloudinary helper
        const pdfUrl = cloudinary.url(uploadResult.public_id, {
            resource_type: 'raw',
            secure: true
        });

        const previewUrl = cloudinary.url(uploadResult.public_id, {
            page: 1,
            format: 'png',
            crop: 'fill',
            width: 400,
            height: 560,
            quality: 'auto',
            secure: true
        });

        console.log(`✅ Cloudinary: PDF & Preview URLs generated successfully.`);

        // 3. Extract PDF text directly from the buffer for AI analysis
        const pdfData = await pdf(req.file.buffer);
        const resumeContent = pdfData.text || '';
        
        // 4. Perform AI Analysis
        const instructions = prepareInstructions({ jobTitle, jobDescription, resumeContent });
        const response = await callGeminiWithRetry(instructions);

        let feedback;
        try {
            const maybe = response?.text ?? response;
            feedback = typeof maybe === 'string' ? JSON.parse(maybe) : maybe;
        } catch (parseErr) {
            feedback = { raw: response?.text ?? String(response) };
        }

        // 5. Save the complete analysis to the Database
        const analysisData = {
            jobTitle,
            jobDescription,
            companyName: companyName || '',
            feedback,
            previewUrl,
            pdfUrl,
            user: userId,
        };

        const newAnalysis = new Analysis(analysisData);
        await newAnalysis.save();

        console.log('✅ Backend: Analysis complete and saved to DB.');

        // 6. Send the full analysis object back to the frontend
        const responseData = {
            ...newAnalysis.toObject(),
            id: newAnalysis._id,
        };

        res.status(200).json(responseData);

    } catch (error) {
        console.error('❌ Backend Error during analysis or upload:', error);
        return res.status(500).json({ error: `Failed to process resume: ${error.message}` });
    }
    // The `finally` block for deleting local files is no longer needed.
};

// --- (getAnalysisById and getAnalysesByUserId remain unchanged and are correct) ---

export const getAnalysisById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await Analysis.findById(id);
        if (!result) {
            return res.status(404).json({ error: 'Analysis not found.' });
        }
        res.status(200).json(result);
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ error: 'Invalid analysis ID format.' });
        }
        res.status(500).json({ error: 'Failed to retrieve analysis.' });
    }
};

export const getAnalysesByUserId = async (req, res) => {
    const { userId } = req.params;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }
        const analyses = await Analysis.find({ user: userId }).sort({ createdAt: -1 });
        res.status(200).json(analyses);
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ error: 'Invalid user ID format.' });
        }
        res.status(500).json({ error: 'Failed to retrieve user analyses.' });
    }
};