// shortlistAI.js
const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");
const axios = require("axios");

const PALM_API_KEY = process.env.GEMINI_API_KEY;

// ------------------- HELPER FUNCTIONS ------------------- //

// Extract text from resume file (PDF or TXT)
async function extractResumeText(resumePath) {
  if (!resumePath) return "";

  const fullPath = path.join(__dirname, resumePath.replace("/uploads/", "uploads/"));
  if (!fs.existsSync(fullPath)) return "";

  if (fullPath.endsWith(".pdf")) {
    const dataBuffer = fs.readFileSync(fullPath);
    const pdfData = await pdfParse(dataBuffer);
    return pdfData.text;
  } else if (fullPath.endsWith(".txt")) {
    return fs.readFileSync(fullPath, "utf8");
  } else {
    return ""; // unsupported format
  }
}

// Compute skill/keyword matching score (max 50)
function computeKeywordScore(job, candidateText) {
  const jobKeywords = [
    ...(job.qualifications || "").split(/[,•\n]/),
    ...(job.responsibilities || "").split(/[,•\n]/),
    ...(job.preferredQualifications || "").split(/[,•\n]/),
    job.title,
  ]
    .map((k) => k.trim().toLowerCase())
    .filter(Boolean);

  candidateText = candidateText.toLowerCase();

  if (!jobKeywords.length || !candidateText) return 0;

  let matches = 0;
  jobKeywords.forEach((k) => {
    if (candidateText.includes(k)) matches++;
  });

  return Math.min(50, Math.round((matches / jobKeywords.length) * 50)); // max 50%
}

// Call Google Gemini/PaLM API to evaluate candidate (max 50)
async function callPaLM(prompt) {
  if (!PALM_API_KEY) throw new Error("GEMINI_API_KEY not set in .env");

  const endpoint =
    "https://generativelanguage.googleapis.com/v1beta2/models/text-bison-001:generateText?key=" +
    PALM_API_KEY;

  const body = {
    prompt: { text: prompt },
    temperature: 0.0,
    maxOutputTokens: 300,
  };

  const res = await axios.post(endpoint, body, {
    headers: { "Content-Type": "application/json" },
  });

  return (
    res.data?.candidates?.[0]?.content?.map((c) => c.text).join("") ||
    res.data?.output?.[0]?.content?.text ||
    ""
  );
}

// Build prompt for AI evaluation
function buildPrompt(job, candidate) {
  return `
You are an HR assistant. Evaluate the candidate for the job.
Return JSON ONLY with: { "score": <0-100>, "summary": "<brief explanation>" }

Job Title: ${job.title}
Job Summary: ${job.jobSummary || ""}
Key Responsibilities: ${job.responsibilities || ""}
Required Qualifications: ${job.qualifications || ""}

Candidate Name: ${candidate.fullName}
Email: ${candidate.email}
Skills: ${candidate.skills}
Experience: ${candidate.experience}
Cover Letter: ${candidate.coverLetter || ""}
Resume File: ${candidate.resumePath || "not provided"}
`;
}

// ------------------- MAIN SHORTLIST FUNCTION ------------------- //

/**
 * Shortlist candidates based on job requirements
 * @param {Object} job - Job object
 * @param {Array} applications - Candidate applications array (Mongoose documents)
 * @returns {Array} shortlisted candidates with score >= 40
 */
async function shortlistCandidates(job, applications) {
  const shortlisted = [];

  for (const candidate of applications) {
    try {
      // 1️⃣ Extract resume text
      const resumeText = await extractResumeText(candidate.resumePath);

      // 2️⃣ Compute keyword/skills score
      const keywordScore = computeKeywordScore(
        job,
        `${resumeText} ${candidate.skills || ""} ${candidate.experience || ""}`
      );

      // 3️⃣ Call AI for additional 50% score
      let aiScore = 0;
      let aiSummary = "";

      try {
        const prompt = buildPrompt(job, candidate);
        const aiRaw = await callPaLM(prompt);

        let parsed = { score: 0, summary: "" };
        try {
          parsed = JSON.parse(aiRaw);
        } catch {
          const scoreMatch = aiRaw.match(/"score"\s*[:=]\s*(\d{1,3})/);
          parsed.score = scoreMatch ? parseInt(scoreMatch[1], 10) : 0;
          parsed.summary = aiRaw.slice(0, 300);
        }

        aiScore = Math.min(50, Math.round((parsed.score || 0) * 0.5)); // AI max 50%
        aiSummary = parsed.summary || "";
      } catch (err) {
        console.error("AI evaluation failed for", candidate.fullName, err.message);
      }

      // 4️⃣ Total score (0–100)
      const totalScore = keywordScore + aiScore;

      // 5️⃣ Only include candidates with totalScore >= 40
      if (totalScore >= 40) {
        shortlisted.push({
          ...candidate.toObject(),
          score: totalScore,
          summary: `Keyword Score: ${keywordScore} | AI Score: ${aiScore}. ${aiSummary}`,
        });
      }
    } catch (err) {
      console.error("Failed processing candidate:", candidate.fullName, err.message);
    }
  }

  // Sort descending by score
  return shortlisted.sort((a, b) => b.score - a.score);
}

module.exports = { shortlistCandidates };
