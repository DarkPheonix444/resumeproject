import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import api from "../api/axios";

export default function ResumeUpload() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

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
    formData.append("ai_enabled", aiEnabled ? "true" : "false");
    if (aiEnabled && jobDescription.trim()) {
      formData.append("job_description", jobDescription.trim());
    }
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

  const resultData = result?.data;
  const scores = resultData?.scores;
  const profile = resultData?.profile;
  const summary = resultData?.skills_summary;
  const breakdown = scores?.breakdown;
  const chartTextColor = "#e5e7eb";

  const formatScore = (value) => Number(value || 0).toFixed(1);
  const formatDateTime = (value) => {
    if (!value) return "-";
    const dateValue = new Date(value);
    if (Number.isNaN(dateValue.getTime())) return "-";
    return dateValue.toLocaleString();
  };

  const breakdownChartData = [
    { name: "Rule-based", value: Number(breakdown?.rule || 0) },
    { name: "AI Visualized", value: Number(breakdown?.semantic || 0) },
    { name: "Experience", value: Number(breakdown?.experience || 0) },
  ];

  const skillsChartData = [
    { name: "Unique", value: Number(summary?.total_unique ?? 0) },
    { name: "Mentions", value: Number(summary?.total_mentions ?? 0) },
    { name: "Diversity", value: Number(summary?.domain_diversity ?? 0) },
  ];

  const pieColors = ["#60a5fa", "#34d399", "#f59e0b"];

  return (
    <div className="upload-page">
      <header className="upload-navbar">
        <div className="upload-navbar-inner">
          <span className="upload-brand">Resume Scanner</span>
        </div>
      </header>

      <main className="upload-main">
        <section className="upload-card">
          <h1>Analyze Your Resume</h1>
          <p className="upload-subtitle">Upload PDF or DOCX to get score, experience level, and skill insights.</p>

          <form className="upload-form" onSubmit={handleSubmit}>
            <input
              className="upload-input-file"
              type="file"
              accept=".pdf,.docx"
              onChange={(e) => setFile(e.target.files[0])}
            />

            <label className="upload-toggle">
              <input
                className="upload-checkbox"
                type="checkbox"
                checked={aiEnabled}
                onChange={(e) => setAiEnabled(e.target.checked)}
              />
              <span>AI Enabled</span>
            </label>

            {aiEnabled && (
              <textarea
                className="upload-textarea"
                placeholder="Add job description (optional)"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={4}
              />
            )}

            <button className="upload-button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Analyzing..." : "Analyze Resume"}
            </button>
          </form>

          {errorMessage && <p className="upload-error">{errorMessage}</p>}
        </section>

        {resultData && (
          <section className="results-layout">
            <div className="metrics-column">
              <article className="result-card">
                <h3>Final Score</h3>
                <p className="result-big">{formatScore(scores?.final)}%</p>
                <p className="result-muted">Confidence: {formatScore(scores?.confidence)}%</p>
                <p className="result-muted">Analyzed at: {formatDateTime(resultData?.analyzed_at)}</p>
              </article>

              <article className="result-card">
                <h3>Experience Profile</h3>
                <div className="experience-section">
                  <div className="level-badge">
                    <span className="level-label">Level</span>
                    <span className="level-value">{profile?.experience_level || "-"}</span>
                  </div>
                  <div className="domains-section">
                    <p className="domains-title">Strong Domains</p>
                    <div className="domain-list">
                      {(profile?.strong_domains || []).length > 0 ? (
                        profile.strong_domains.map((domain) => (
                          <span key={domain} className="domain-pill">{domain}</span>
                        ))
                      ) : (
                        <p className="result-muted">No strong domains found.</p>
                      )}
                    </div>
                  </div>
                </div>
              </article>

              <article className="result-card">
                <h3>Skills Summary</h3>
                <div className="skills-stats">
                  <div className="stat-box">
                    <div className="stat-number">{summary?.total_unique ?? 0}</div>
                    <div className="stat-label">Unique Skills</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-number">{summary?.total_mentions ?? 0}</div>
                    <div className="stat-label">Mentions</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-number">{summary?.domain_diversity ?? 0}</div>
                    <div className="stat-label">Diversity</div>
                  </div>
                </div>
              </article>
            </div>

            <div className="charts-column">
              <article className="result-card chart-card">
                <h3>Score Breakdown Chart</h3>
                <div className="chart-wrap">
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={breakdownChartData} margin={{ top: 8, right: 12, left: -12, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="name" stroke={chartTextColor} tick={{ fill: chartTextColor }} />
                      <YAxis domain={[0, 100]} stroke={chartTextColor} tick={{ fill: chartTextColor }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151", color: "#f9fafb" }}
                        formatter={(value) => `${Number(value).toFixed(1)}%`}
                      />
                      <Bar dataKey="value" fill="#60a5fa" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </article>

              <article className="result-card chart-card">
                <h3>Skills Mix Chart</h3>
                <div className="chart-wrap">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={skillsChartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        innerRadius={40}
                        label
                      >
                        {skillsChartData.map((entry, index) => (
                          <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151", color: "#f9fafb" }} />
                      <Legend wrapperStyle={{ color: chartTextColor }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </article>
            </div>
          </section>
        )}
      </main>

      <footer className="upload-footer">All rightts reserved by darkpheonix 444</footer>
    </div>
  );
}
