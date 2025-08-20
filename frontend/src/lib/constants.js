// frontend/src/lib/constants.js

export const resumes = [
    {
        id: "mock-1",
        companyName: "Google",
        jobTitle: "Frontend Developer",
        // The pdfUrl for mock data should point to a real PDF in your public folder
        pdfUrl: "/mock-resumes/resume_01.pdf",
        // The resumePath is used by ResumeCard for the image preview
        resumePath: "/images/resume_01.png",
        feedback: {
            overallScore: 85,
            ATS: {
                score: 90,
                tips: [
                    { type: 'good', tip: 'Keywords Match', explanation: 'Your resume includes several key terms from the job description like "React" and "TypeScript".' },
                    { type: 'improvement', tip: 'Action Verbs', explanation: 'Consider starting each bullet point with a stronger action verb to increase impact.' },
                ],
            },
            toneAndStyle: {
                score: 80,
                tips: [
                    { type: 'good', tip: 'Professional Tone', explanation: 'The language used is professional and appropriate for a corporate role.' },
                ],
            },
            content: {
                score: 88,
                tips: [
                    { type: 'good', tip: 'Quantifiable Results', explanation: 'You effectively used numbers to demonstrate your impact, such as "increased performance by 20%".' },
                ],
            },
            structure: {
                score: 92,
                tips: [
                    { type: 'good', tip: 'Clear Sections', explanation: 'The resume is well-organized with clear, distinct sections for experience, skills, and education.' },
                ],
            },
            skills: {
                score: 75,
                tips: [
                    { type: 'improvement', tip: 'Missing Skills', explanation: 'The job description mentions "GraphQL", which is not listed in your skills section. Consider adding it if you have experience.' },
                ],
            },
        },
    },
    {
        id: "mock-2",
        companyName: "Microsoft",
        jobTitle: "Cloud Engineer",
        pdfUrl: "/mock-resumes/resume_02.pdf",
        resumePath: "/images/resume_02.png",
        feedback: {
            overallScore: 55,
            ATS: {
                score: 45,
                tips: [
                    { type: 'improvement', tip: 'Keyword Density', explanation: 'Your resume is missing critical keywords like "Azure DevOps" and "Terraform" found in the job description.' },
                ],
            },
            toneAndStyle: {
                score: 60,
                tips: [
                    { type: 'good', tip: 'Concise Language', explanation: 'Your bullet points are concise and to the point.' },
                ],
            },
            content: {
                score: 50,
                tips: [
                    { type: 'improvement', tip: 'Focus on Achievements', explanation: 'Try to rephrase job duties as achievements. Instead of "Responsible for servers," say "Managed 50+ production servers with 99.9% uptime."' },
                ],
            },
            structure: {
                score: 70,
                tips: [
                    { type: 'good', tip: 'Standard Format', explanation: 'The resume follows a standard chronological format, which is easy for recruiters to read.' },
                ],
            },
            skills: {
                score: 50,
                tips: [
                    { type: 'improvement', tip: 'Categorize Skills', explanation: 'Consider grouping your skills into categories like "Cloud Platforms", "Languages", and "Tools" for better readability.' },
                ],
            },
        },
    },
    {
        id: "mock-3",
        companyName: "Apple",
        jobTitle: "iOS Developer",
        pdfUrl: "/mock-resumes/resume_03.pdf",
        resumePath: "/images/resume_03.png",
        feedback: {
            overallScore: 75,
            ATS: {
                score: 80,
                tips: [
                    { type: 'good', tip: 'Relevant Keywords', explanation: 'Keywords such as "Swift", "UIKit", and "CoreData" are present and relevant.' },
                ],
            },
            toneAndStyle: {
                score: 70,
                tips: [
                    { type: 'good', tip: 'Clear and Professional', explanation: 'The tone is professional and confident.' },
                ],
            },
            content: {
                score: 75,
                tips: [
                    { type: 'good', tip: 'Project Links', explanation: 'Including links to your portfolio and GitHub is a great way to showcase your work.' },
                ],
            },
            structure: {
                score: 80,
                tips: [
                    { type: 'good', tip: 'Good Readability', explanation: 'The layout is clean and uses whitespace effectively, making it easy to read.' },
                ],
            },
            skills: {
                score: 70,
                tips: [
                    { type: 'improvement', tip: 'Expand on Soft Skills', explanation: 'While your technical skills are strong, consider adding a brief section on soft skills like "Team Collaboration" or "Agile Methodologies".' },
                ],
            },
        },
    },
];