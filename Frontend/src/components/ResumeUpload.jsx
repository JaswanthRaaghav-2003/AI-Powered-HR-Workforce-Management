import React, { useState } from "react";
import "../index.css";

const ResumeUpload = () => {
  const [file, setFile] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [atsScore, setAtsScore] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setSuccess(true);
    await evaluateResume(selectedFile);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragActive(false);
    const droppedFile = e.dataTransfer.files[0];
    if (!droppedFile) return;
    setFile(droppedFile);
    setSuccess(true);
    await evaluateResume(droppedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = () => {
    setIsDragActive(false);
  };

  // Function to send resume to Gemini API
  const evaluateResume = async (file) => {
    setLoading(true);
    setAtsScore(null);

    try {
      // Convert file to base64
      const base64File = await fileToBase64(file);

      // Gemini API request payload
      const payload = {
        model: "gemini-1.5",
        messages: [
          {
            role: "user",
            content: `Evaluate this resume for ATS compatibility and provide a score from 0 to 100:\n${base64File}`,
          },
        ],
      };

      // Call the Google Gemini API
      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta2/models/gemini-1.5:generateMessage?key=YOUR_API_KEY",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();
      // Extract Gemini response
      const atsText = data?.candidates?.[0]?.content?.[0]?.text || "No score received";
      setAtsScore(atsText);
    } catch (error) {
      console.error("Error evaluating resume:", error);
      setAtsScore("Error evaluating resume");
    } finally {
      setLoading(false);
    }
  };

  // Helper: convert file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  return (
    <section id="ats">
      <div className="upload-section">
        <h2 className="upload-title">How good is your resume?</h2>
        <p className="upload-description">
          Find out instantly. Upload your resume and our free resume scanner will
          evaluate it against key criteria hiring managers and applicant tracking
          systems (ATS) look for. Get actionable feedback on how to improve your
          resume's success rate.
        </p>

        <div
          className={`upload-box ${isDragActive ? "drag-active" : ""}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => document.getElementById("fileInput").click()}
        >
          <input
            id="fileInput"
            type="file"
            accept=".pdf,.docx"
            className="hidden"
            onChange={handleFileChange}
          />
          <div className="upload-content">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              className="upload-icon"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M12 12v8m0-8l-3 3m3-3l3 3m0-12h.01M12 3v7"
              />
            </svg>
            <p className="upload-text">
              Drop your resume here or <span className="choose-file">choose a file</span>.
            </p>
            <p className="upload-subtext">
              English resumes in PDF or DOCX only. Max 2MB file size.
            </p>
          </div>
        </div>

        {success && (
          <p className="upload-success">{file.name} uploaded successfully!</p>
        )}
        {loading && <p>Evaluating resume... Please wait.</p>}
        {atsScore && (
          <p className="upload-score">ATS Score / Feedback: {atsScore}</p>
        )}
      </div>
    </section>
  );
};

export default ResumeUpload;
