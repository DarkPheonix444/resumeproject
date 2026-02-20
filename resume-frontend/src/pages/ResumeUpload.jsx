import { useState, useEffect } from 'react';
import api from "../api/axios";

export default function ResumeUpload() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) {
      window.location.href = "/login";
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setResult(null);

    if (!file) {
      setErrorMessage("Please select a PDF or DOCX file first.");
      return;
    }

    const token = localStorage.getItem("access");
    if (!token) {
      setErrorMessage("Please log in first to analyze your resume.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    setIsSubmitting(true);

    try {
      const response = await api.post(
        "/resume-analysis/analyze/",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setResult(response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        setErrorMessage("Session expired or unauthorized. Please log in again.");
      } else if (error.response?.data?.error?.message) {
        setErrorMessage(error.response.data.error.message);
      } else {
        setErrorMessage("Failed to analyze resume. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h2>Upload Resume</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="file"
          accept=".pdf,.docx"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Analyzing..." : "Analyze"}
        </button>
      </form>

      {errorMessage && <p>{errorMessage}</p>}

      {result && (
        <div>
          <h3>Final Score: {result?.data?.scores?.final}</h3>
          <p>Confidence: {result?.data?.scores?.confidence}</p>
        </div>
      )}
    </div>
  );
}
