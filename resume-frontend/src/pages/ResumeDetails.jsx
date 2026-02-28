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
  const jdMatching = resultData?.jd_matching;
  const hasValidJdMatching =
    jdMatching &&
    Number.isFinite(Number(jdMatching?.jd_score)) &&
    Number(jdMatching?.total_required_skills || 0) > 0;
  const breakdown = scores?.breakdown;
  const chartTextColor = "#e5e7eb";

  const formatScore = (value) => Number(value || 0).toFixed(1);
  const formatDateTime = (value) => {
    if (!value) return "-";
    const dateValue = new Date(value);
    if (Number.isNaN(dateValue.getTime())) return "-";
    return dateValue.toLocaleString();
  };

  const normalizedScore = Math.min(100, Math.max(0, Number(scores?.final || 0)));

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

  const jdComparisonData = [
    { name: "Matched", value: Number(jdMatching?.total_matched_skills || 0) },
    {
      name: "Missing",
      value: Math.max(
        0,
        Number(jdMatching?.total_required_skills || 0) - Number(jdMatching?.total_matched_skills || 0)
      ),
    },
    { name: "Extra", value: Number((jdMatching?.extra_skills || []).length || 0) },
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
                  <article className="result-card score-card">
                    <div className="score-card-header">
                      <div>
                        <p className="score-title">Final Score</p>
                        <p className="score-subtitle">Overall resume match</p>
                      </div>
                    </div>
                    <div className="score-ring" style={{ "--score": normalizedScore }}>
                      <div className="score-ring-inner">
                        <span className="score-ring-value">{formatScore(scores?.final)}%</span>
                        <span className="score-ring-label">Score</span>
                      </div>
                    </div>
                    <div className="score-card-meta">
                      <div className="score-meta">
                        <span className="score-meta-label">Confidence</span>
                        <span className="score-meta-value">{formatScore(scores?.confidence)}%</span>
                      </div>
                      <div className="score-meta">
                        <span className="score-meta-label">Analyzed</span>
                        <span className="score-meta-value">{formatDateTime(resultData?.analyzed_at)}</span>
                      </div>
                    </div>
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

              <section className="jd-match-section">
                {hasValidJdMatching ? (
                  <article className="result-card jd-match-card">
                    <div className="jd-match-header">
                      <h3>JD Match Analysis</h3>
                      <span className="jd-score-badge">{formatScore(jdMatching?.jd_score)}%</span>
                    </div>
                    <div className="jd-progress-track">
                      <div
                        className="jd-progress-fill"
                        style={{ width: `${Math.min(100, Math.max(0, Number(jdMatching?.jd_score || 0)))}%` }}
                      />
                    </div>
                    <div className="jd-stats-row">
                      <div className="jd-stat-box">
                        <span className="jd-stat-label">Required Skills</span>
                        <span className="jd-stat-value">{jdMatching?.total_required_skills ?? 0}</span>
                      </div>
                      <div className="jd-stat-box">
                        <span className="jd-stat-label">Matched Skills</span>
                        <span className="jd-stat-value">{jdMatching?.total_matched_skills ?? 0}</span>
                      </div>
                    </div>

                    <div className="jd-graph-wrap">
                      <ResponsiveContainer width="100%" height={190}>
                        <BarChart data={jdComparisonData} margin={{ top: 8, right: 12, left: -8, bottom: 8 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis dataKey="name" stroke={chartTextColor} tick={{ fill: chartTextColor }} />
                          <YAxis stroke={chartTextColor} tick={{ fill: chartTextColor }} />
                          <Tooltip
                            contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151", color: "#f9fafb" }}
                          />
                          <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                            {jdComparisonData.map((entry) => (
                              <Cell
                                key={entry.name}
                                fill={entry.name === "Matched" ? "#34d399" : entry.name === "Missing" ? "#f59e0b" : "#60a5fa"}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="jd-skill-lists">
                      <div className="jd-skill-block">
                        <p className="jd-skill-title">Matched Skills</p>
                        <div className="jd-chip-wrap">
                          {(jdMatching?.matched_skills || []).length > 0 ? (
                            jdMatching.matched_skills.map((skill) => (
                              <span key={`m-${skill}`} className="jd-chip jd-chip-green">{skill}</span>
                            ))
                          ) : (
                            <span className="jd-chip jd-chip-empty">None</span>
                          )}
                        </div>
                      </div>

                      <div className="jd-skill-block">
                        <p className="jd-skill-title">Missing Skills</p>
                        <div className="jd-chip-wrap">
                          {(jdMatching?.missing_skills || []).length > 0 ? (
                            jdMatching.missing_skills.map((skill) => (
                              <span key={`x-${skill}`} className="jd-chip jd-chip-amber">{skill}</span>
                            ))
                          ) : (
                            <span className="jd-chip jd-chip-empty">None</span>
                          )}
                        </div>
                      </div>

                      <div className="jd-skill-block">
                        <p className="jd-skill-title">Extra Skills</p>
                        <div className="jd-chip-wrap">
                          {(jdMatching?.extra_skills || []).length > 0 ? (
                            jdMatching.extra_skills.map((skill) => (
                              <span key={`e-${skill}`} className="jd-chip jd-chip-blue">{skill}</span>
                            ))
                          ) : (
                            <span className="jd-chip jd-chip-empty">None</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                ) : (
                  <article className="result-card jd-match-card jd-match-empty">
                    <h3>JD Match Analysis</h3>
                    <p className="result-muted">JD comparison is shown only when a valid job description is provided.</p>
                  </article>
                )}
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
