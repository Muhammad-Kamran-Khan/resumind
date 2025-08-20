// File: models/Analysis.js
import mongoose from 'mongoose';

// Define the schema for the nested feedback tips
const tipSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
    },
    tip: {
        type: String,
        required: true,
    },
    explanation: {
        type: String,
        required: true,
    },
});

// Define the schema for the main feedback categories (ATS, Tone, Content, etc.)
const categorySchema = new mongoose.Schema({
    score: {
        type: Number,
        required: true,
    },
    tips: {
        type: [tipSchema], // Array of tip objects
        default: [],
    },
});

// Main Analysis Schema
const analysisSchema = new mongoose.Schema({
    // Add a reference to the User model to associate the analysis with a specific user.
    // The 'ref' property tells Mongoose which model to use for population.
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Assumes you have a 'User' model defined
        required: true, // Ensures every analysis is linked to a user
    },
    jobTitle: {
        type: String,
        required: true,
    },
    jobDescription: {
        type: String,
    },
    previewUrl: {
        type: String,
    },
    feedback: {
        overallScore: {
            type: Number,
            required: true,
        },
        ATS: {
            type: categorySchema,
            required: true,
        },
        toneAndStyle: {
            type: categorySchema,
            required: true,
        },
        content: {
            type: categorySchema,
            required: true,
        },
        structure: {
            type: categorySchema,
            required: true,
        },
        skills: {
            type: categorySchema,
            required: true,
        },
    },
    // Optional: Add a timestamp for when the analysis was created
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true, // Adds createdAt and updatedAt timestamps automatically
});

// Create and export the Mongoose model
const Analysis = mongoose.model('Analysis', analysisSchema);

export default Analysis;
