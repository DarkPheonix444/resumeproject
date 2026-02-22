import { useState, useEffect } from 'react';
import { useNavigate, useParams } from "react-router-dom";
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
import Sidebar from "../components/Sidebar";
import ToggleSidebarButton from "../components/ToggleSidebarButton";
import api from "../api/axios";

export default function ResumeDetails() {
  const { id } = useParams();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchAnalysis = async () => {
      try {
        setLoading(true);
        // Fetch the resume with its latest analysis
        const response = await api.get(`/resume-analysis/resumes/${id}/`);
        
        if (response.data.latest_analysis) {
          setAnalysis(response.data.latest_analysis);
        } else {
          setError("No analysis found for this resume.");
        }
      } catch (err) {
        console.error("Error fetching resume:", err);
        setError("Failed to load resume details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [id, navigate]);

  const resultData = analysis?.data;
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

  const navigateBack = () => {
    navigate("/history");
  };

  return (
    <div className="page-with-sidebar">
      <Sidebar />
      <div className="upload-page">
        <header className="upload-navbar">
          <div className="upload-navbar-inner">
            <ToggleSidebarButton />
            <span className="upload-brand">Resume Details</span>
          </div>
        </header>

        <main className="upload-main">
          {loading && <div className="upload-error" style={{ color: "#60a5fa", marginBottom: "20px" }}>📂 Loading resume details...</div>}
          
          {error && <div className="upload-error">{error}</div>}

          {!loading && !error && analysis && (
            <>
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

              <section style={{ marginTop: "24px", textAlign: "center" }}>
                <button className="upload-button" onClick={navigateBack}>
                  ← Back to History
                </button>
              </section>
            </>
          )}
        </main>

        <footer className="upload-footer">All rights reserved by darkpheonix 444</footer>
      </div>
    </div>
  );
}
