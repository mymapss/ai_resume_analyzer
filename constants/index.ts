// constants/index.ts - Updated prepareInstructions

export const AIResponseFormat = `
{
  "overallScore": <number 0-100>,
  "ATS": {
    "score": <number 0-100>,
    "tips": [
      {
        "type": "good" | "improve",
        "tip": "<string>"
      }
    ]
  },
  "toneAndStyle": {
    "score": <number 0-100>,
    "tips": [
      {
        "type": "good" | "improve",
        "tip": "<string - short title>",
        "explanation": "<string - detailed explanation>"
      }
    ]
  },
  "content": {
    "score": <number 0-100>,
    "tips": [
      {
        "type": "good" | "improve",
        "tip": "<string - short title>",
        "explanation": "<string - detailed explanation>"
      }
    ]
  },
  "structure": {
    "score": <number 0-100>,
    "tips": [
      {
        "type": "good" | "improve",
        "tip": "<string - short title>",
        "explanation": "<string - detailed explanation>"
      }
    ]
  },
  "skills": {
    "score": <number 0-100>,
    "tips": [
      {
        "type": "good" | "improve",
        "tip": "<string - short title>",
        "explanation": "<string - detailed explanation>"
      }
    ]
  }
}`;

export const prepareInstructions = ({jobTitle, jobDescription}: { jobTitle: string; jobDescription: string; }) =>
    `You are an expert in ATS (Applicant Tracking System) and resume analysis.
Please analyze and rate this resume for the following position:

Job Title: ${jobTitle}
Job Description: ${jobDescription}

ANALYSIS REQUIREMENTS:
1. Be thorough and detailed in your analysis
2. Don't be afraid to give low scores if the resume needs significant improvement
3. Provide 3-4 actionable tips for each category
4. Consider the job description when evaluating relevance and keyword optimization
5. Focus on both strengths (type: "good") and areas for improvement (type: "improve")

SCORING GUIDELINES:
- overallScore: Overall resume quality (0-100)
- ATS score: Keyword optimization, formatting, and ATS compatibility
- toneAndStyle: Professional language, consistency, and appropriate tone
- content: Relevance, achievements, quantifiable results, and impact
- structure: Organization, readability, visual hierarchy, and formatting
- skills: Technical/soft skills presentation and alignment with job requirements

CRITICAL INSTRUCTIONS:
- Return ONLY a valid JSON object
- Do NOT include markdown code blocks (\`\`\`json or \`\`\`)
- Do NOT include any explanatory text before or after the JSON
- Do NOT include comments in the JSON
- Ensure all strings are properly escaped
- Use the exact structure shown below

REQUIRED JSON FORMAT:
${AIResponseFormat}

Your response must be PURE JSON starting with { and ending with }. Nothing else.`;

export const resumes: Resume[] = [
    {
        id: "1",
        companyName: "Google",
        jobTitle: "Frontend Developer",
        imagePath: "/images/resume_01.png",
        resumePath: "/resumes/resume-1.pdf",
        feedback: {
            overallScore: 85,
            ATS: {
                score: 90,
                tips: [],
            },
            toneAndStyle: {
                score: 90,
                tips: [],
            },
            content: {
                score: 90,
                tips: [],
            },
            structure: {
                score: 90,
                tips: [],
            },
            skills: {
                score: 90,
                tips: [],
            },
        },
    },
    {
        id: "2",
        companyName: "Microsoft",
        jobTitle: "Cloud Engineer",
        imagePath: "/images/resume_02.png",
        resumePath: "/resumes/resume-2.pdf",
        feedback: {
            overallScore: 55,
            ATS: {
                score: 90,
                tips: [],
            },
            toneAndStyle: {
                score: 90,
                tips: [],
            },
            content: {
                score: 90,
                tips: [],
            },
            structure: {
                score: 90,
                tips: [],
            },
            skills: {
                score: 90,
                tips: [],
            },
        },
    },
    {
        id: "3",
        companyName: "Apple",
        jobTitle: "iOS Developer",
        imagePath: "/images/resume_03.png",
        resumePath: "/resumes/resume-3.pdf",
        feedback: {
            overallScore: 75,
            ATS: {
                score: 90,
                tips: [],
            },
            toneAndStyle: {
                score: 90,
                tips: [],
            },
            content: {
                score: 90,
                tips: [],
            },
            structure: {
                score: 90,
                tips: [],
            },
            skills: {
                score: 90,
                tips: [],
            },
        },
    },
    {
        id: "4",
        companyName: "Google",
        jobTitle: "Frontend Developer",
        imagePath: "/images/resume_01.png",
        resumePath: "/resumes/resume-1.pdf",
        feedback: {
            overallScore: 85,
            ATS: {
                score: 90,
                tips: [],
            },
            toneAndStyle: {
                score: 90,
                tips: [],
            },
            content: {
                score: 90,
                tips: [],
            },
            structure: {
                score: 90,
                tips: [],
            },
            skills: {
                score: 90,
                tips: [],
            },
        },
    },
    {
        id: "5",
        companyName: "Microsoft",
        jobTitle: "Cloud Engineer",
        imagePath: "/images/resume_02.png",
        resumePath: "/resumes/resume-2.pdf",
        feedback: {
            overallScore: 55,
            ATS: {
                score: 90,
                tips: [],
            },
            toneAndStyle: {
                score: 90,
                tips: [],
            },
            content: {
                score: 90,
                tips: [],
            },
            structure: {
                score: 90,
                tips: [],
            },
            skills: {
                score: 90,
                tips: [],
            },
        },
    },
    {
        id: "6",
        companyName: "Apple",
        jobTitle: "iOS Developer",
        imagePath: "/images/resume_03.png",
        resumePath: "/resumes/resume-3.pdf",
        feedback: {
            overallScore: 75,
            ATS: {
                score: 90,
                tips: [],
            },
            toneAndStyle: {
                score: 90,
                tips: [],
            },
            content: {
                score: 90,
                tips: [],
            },
            structure: {
                score: 90,
                tips: [],
            },
            skills: {
                score: 90,
                tips: [],
            },
        },
    },
];