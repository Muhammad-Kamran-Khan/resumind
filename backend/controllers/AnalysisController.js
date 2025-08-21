// backend/controllers/AnalysisController.js

import { prepareInstructions } from '../utils/analysisUtils.js';
import { callGeminiWithRetry } from '../services/gemini.js';
import Analysis from '../models/Analysis.js';
import User from '../models/User.js';
import cloudinary from '../config/cloudinary.js';
import streamifier from 'streamifier';

/**
 * Dynamically load a working pdfjs-dist module.
 * Tries several possible entry points so this file works across
 * different pdfjs-dist versions/install layouts.
 */
async function loadPdfJs() {
  // Try a few common entry points in order of preference
  const candidates = [
    'pdfjs-dist/legacy/build/pdf.mjs',
    'pdfjs-dist/legacy/build/pdf.js',
    'pdfjs-dist/es5/build/pdf.js',
    'pdfjs-dist/build/pdf.js',
    'pdfjs-dist' // last-ditch attempt (package main)
  ];

  let lastErr = null;
  for (const path of candidates) {
    try {
      const mod = await import(path);
      // Some packages export default, others use named exports
      const pdfjs = mod.default ? mod.default : mod;
      // If GlobalWorkerOptions exists, disable worker for server
      if (pdfjs && pdfjs.GlobalWorkerOptions) {
        pdfjs.GlobalWorkerOptions.disableWorker = true;
      }
      return pdfjs;
    } catch (err) {
      lastErr = err;
      // continue to next candidate
    }
  }

  throw new Error(
    'Unable to load pdfjs-dist. Please install pdfjs-dist (npm i pdfjs-dist) or try a different version. Last error: ' +
      (lastErr && lastErr.message ? lastErr.message : String(lastErr))
  );
}

/**
 * Extract full text from an in-memory PDF buffer using pdfjs-dist.
 * Returns a string with concatenated page text.
 */
async function extractTextFromPdfBuffer(buffer) {
  const pdfjs = await loadPdfJs();

  // getDocument returns a loadingTask with a `promise` property in most builds
  const loadingTask = pdfjs.getDocument({ data: buffer });
  const pdfDoc = await loadingTask.promise;

  let resumeContent = '';
  const numPages = pdfDoc.numPages || 0;

  for (let i = 1; i <= numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const textContent = await page.getTextContent();
    // map robustly for different pdfjs item shapes
    const pageText = (textContent.items || [])
      .map((item) => {
        // item.str is common; item.unicode sometimes appears; fallback to empty string
        return item.str ?? item.unicode ?? '';
      })
      .join(' ');
    resumeContent += pageText + '\n';
  }

  return resumeContent.trim();
}

export const handleResumeUpload = async (req, res) => {
  console.log('--- Backend: Received request (in-memory) ---');

  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: 'No resume file uploaded.' });
    }

    if (req.file.mimetype !== 'application/pdf') {
      return res.status(400).json({ error: 'Invalid file type. Only PDFs are allowed.' });
    }

    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated.' });
    }

    const { jobTitle, jobDescription, companyName } = req.body;
    if (!jobTitle) {
      return res.status(400).json({ error: 'Job title is required.' });
    }

    // 1. Upload buffer to Cloudinary using upload_stream
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          folder: 'resumes'
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
    });

    if (!uploadResult) {
      throw new Error('Cloudinary upload returned no result.');
    }

    // 2. Generate Cloudinary URLs (pdf + preview)
    // Use public_id to create raw/pdf url and a png preview for page 1
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

    console.log('✅ Cloudinary: PDF & Preview URLs generated successfully.');

    // 3. Extract text from the uploaded PDF buffer
    const resumeContent = await extractTextFromPdfBuffer(req.file.buffer);

    // 4. Prepare instructions and call Gemini (or whatever AI service)
    const instructions = prepareInstructions({ jobTitle, jobDescription, resumeContent });
    const response = await callGeminiWithRetry(instructions);

    // 5. Try to parse response as JSON, otherwise keep raw text
    let feedback;
    try {
      const maybe = response?.text ?? response;
      feedback = typeof maybe === 'string' ? JSON.parse(maybe) : maybe;
    } catch (parseErr) {
      feedback = { raw: response?.text ?? String(response) };
    }

    // 6. Save analysis
    const newAnalysis = new Analysis({
      jobTitle,
      jobDescription,
      companyName: companyName || '',
      feedback,
      previewUrl,
      pdfUrl,
      user: userId
    });
    await newAnalysis.save();

    console.log('✅ Backend: Analysis complete and saved to DB.');

    // 7. Return saved analysis
    return res.status(200).json(newAnalysis);
  } catch (error) {
    // detailed error logging
    console.error('❌ Backend Error during analysis or upload:', error);
    const message = error && error.message ? error.message : String(error);
    return res.status(500).json({ error: `Failed to process resume: ${message}` });
  }
};

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