// File: utils/analysisUtils.js
import { Type } from "@google/genai";

export const resumeAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        overallScore: { type: Type.NUMBER },
        ATS: {
            type: Type.OBJECT,
            properties: {
                score: { type: Type.NUMBER },
                tips: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            type: { type: Type.STRING },
                            tip: { type: Type.STRING },
                            explanation: { type: Type.STRING },
                        },
                    },
                },
            },
        },
        toneAndStyle: {
            type: Type.OBJECT,
            properties: {
                score: { type: Type.NUMBER },
                tips: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            type: { type: Type.STRING },
                            tip: { type: Type.STRING },
                            explanation: { type: Type.STRING },
                        },
                    },
                },
            },
        },
        content: {
            type: Type.OBJECT,
            properties: {
                score: { type: Type.NUMBER },
                tips: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            type: { type: Type.STRING },
                            tip: { type: Type.STRING },
                            explanation: { type: Type.STRING },
                        },
                    },
                },
            },
        },
        structure: {
            type: Type.OBJECT,
            properties: {
                score: { type: Type.NUMBER },
                tips: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            type: { type: Type.STRING },
                            tip: { type: Type.STRING },
                            explanation: { type: Type.STRING },
                        },
                    },
                },
            },
        },
        skills: {
            type: Type.OBJECT,
            properties: {
                score: { type: Type.NUMBER },
                tips: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            type: { type: Type.STRING },
                            tip: { type: Type.STRING },
                            explanation: { type: Type.STRING },
                        },
                    },
                },
            },
        },
    },
};

export const prepareInstructions = ({ jobTitle, jobDescription, resumeContent }) =>
    `You are an expert in ATS (Applicant Tracking System) and resume analysis.
    Please analyze and rate this resume and suggest how to improve it.
    The rating can be low if the resume is bad.
    Be thorough and detailed. Don't be afraid to point out any mistakes or areas for improvement.
    If there is a lot to improve, don't hesitate to give low scores. This is to help the user to improve their resume.
    If available, use the job description for the job user is applying to to give more detailed feedback.
    If provided, take the job description into consideration.
    The job title is: ${jobTitle}
    The job description is: ${jobDescription}
    The resume content is:
    """
    ${resumeContent}
    """
    Provide the feedback using the following JSON format without any other text:`;