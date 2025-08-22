// Import polyfills first so pdfjs-dist won't fail at module-eval time.
import '../polyfills.js';

import { createRequire } from 'module';
import { prepareInstructions } from '../utils/analysisUtils.js';
import { callGeminiWithRetry } from '../services/gemini.js';
import Analysis from '../models/Analysis.js';
import User from '../models/User.js';
import cloudinary from '../config/cloudinary.js';
import streamifier from 'streamifier';

// ========================================================================
// FINAL, ROBUST FIX: Use createRequire to reliably load the CommonJS
// version of pdfjs-dist, bypassing ESM import resolution issues.
// ========================================================================
const require = createRequire(import.meta.url);
const pdfjs = require('pdfjs-dist/build/pdf.cjs');

/**
 * Extracts text from a PDF buffer using pdfjs-dist.
 */
async function extractTextFromPdfBuffer(buffer) {
  const uint8Array = new Uint8Array(buffer);

  // The worker is disabled by default in the CJS build, so we can
  // directly call getDocument.
  const loadingTask = pdfjs.getDocument({ data: uint8Array });
  const pdfDoc = await loadingTask.promise;
  let resumeContent = '';
  const numPages = pdfDoc.numPages || 0;
  for (let i = 1; i <= numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = (textContent.items || []).map(item => item.str ?? item.unicode ?? '').join(' ');
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

    const cloudinaryUploadPromise = new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: 'auto', folder: 'resumes' },
        (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new Error('Cloudinary upload returned no result.'));
          resolve(result);
        }
      );
      streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
    });

    const extractTextPromise = extractTextFromPdfBuffer(req.file.buffer);

    const [uploadResult, resumeContent] = await Promise.all([
      cloudinaryUploadPromise,
      extractTextPromise
    ]);

    console.log('✅ Cloudinary upload and text extraction complete.');

    const pdfUrl = cloudinary.url(uploadResult.public_id, { resource_type: 'raw', secure: true });
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

    const instructions = prepareInstructions({ jobTitle, jobDescription, resumeContent });
    const response = await callGeminiWithRetry(instructions);

    let feedback;
    try {
      const maybe = response?.text ?? response;
      feedback = typeof maybe === 'string' ? JSON.parse(maybe) : maybe;
    } catch (parseErr) {
      feedback = { raw: response?.text ?? String(response) };
    }

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
    return res.status(200).json(newAnalysis);

  } catch (error) {
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