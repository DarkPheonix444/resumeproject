import {useState,useEffect} from 'react';
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import ToggleSidebarButton from "../components/ToggleSidebarButton";
import api from "../api/axios";
import "../styles/history.css";

export default function History() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [nextPage, setNextPage] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

    const navigate = useNavigate();

    const fetchResumes=async (url="/resume-analysis/resumes/") => {
        try {
            setLoading(true);
            const response = await api.get(url);

            const data = response.data.results || response.data;
            setHistory(data);

            setNextPage(response.data.next || null);
        } catch (err) {
            setError("Failed to fetch resume history. Please try again.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResumes();
    }, []);

    const handleDeleteResume = async (resumeId) => {
      const confirmed = window.confirm("Delete this resume and its analysis history?");
      if (!confirmed) return;

      try {
        setDeletingId(resumeId);
        await api.delete(`/resume-analysis/resumes/${resumeId}/`);
        setHistory((prev) => prev.filter((item) => item.id !== resumeId));
      } catch (err) {
        console.error("Failed to delete resume:", err);
        setError("Failed to delete resume. Please try again.");
      } finally {
        setDeletingId(null);
      }
    };

  return (
    <div className="page-with-sidebar">
      <Sidebar />
      <div className="history-page">
        <header className="history-navbar">
          <div className="history-navbar-inner">
            <ToggleSidebarButton />
            <span className="history-brand">Resume History</span>
          </div>
        </header>

        <main className="history-main">
          <section className="history-container">
            {loading && <div className="history-loading">📂 Loading your resume history...</div>}
            
            {error && <div className="history-error">{error}</div>}
            
            {!loading && !error && history.length === 0 && (
              <div className="history-empty">
                <p>No resumes uploaded yet.</p>
                <p className="empty-subtitle">Upload your first resume to get started!</p>
              </div>
            )}

            {!loading && !error && history.length > 0 && (
              <>
                <div className="history-header">
                  <h2>Your Resumes</h2>
                  <p className="history-count">{history.length} resume{history.length !== 1 ? 's' : ''} found</p>
                </div>

                <div className="history-grid">
                  {history.map((resume, index) => {
                    const jdMatching = resume.latest_analysis?.data?.jd_matching;
                    const hasValidJdMatching =
                      jdMatching &&
                      Number.isFinite(Number(jdMatching?.jd_score)) &&
                      Number(jdMatching?.total_required_skills || 0) > 0;

                    return (
                    <div key={resume.id} className="history-card">
                      <button
                        className="card-delete-btn"
                        onClick={() => handleDeleteResume(resume.id)}
                        disabled={deletingId === resume.id}
                        title="Delete resume"
                        aria-label="Delete resume"
                      >
                        {deletingId === resume.id ? "..." : "🗑"}
                      </button>

                      <div className="card-header">
                        <div className="card-number">#{index + 1}</div>
                        <div className="card-date">
                          {new Date(resume.uploaded_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                      </div>

                      {resume.latest_analysis ? (
                        <div className="card-content">
                          <div className="score-section">
                            <div className="score-label">Latest Score</div>
                            <div className="score-value">
                              {resume.latest_analysis.total_score.toFixed(1)}%
                            </div>
                          </div>

                          {hasValidJdMatching && (
                            <div className="jd-history-box">
                              <div className="jd-history-top">
                                <span className="jd-history-title">JD Match</span>
                                <span className="jd-history-score">{Number(jdMatching?.jd_score || 0).toFixed(1)}%</span>
                              </div>
                              <div className="jd-history-track">
                                <div
                                  className="jd-history-fill"
                                  style={{ width: `${Math.min(100, Math.max(0, Number(jdMatching?.jd_score || 0)))}%` }}
                                />
                              </div>
                              <div className="jd-history-meta">
                                {jdMatching?.total_matched_skills ?? 0} / {jdMatching?.total_required_skills ?? 0} matched
                              </div>
                              <div className="jd-history-details">
                                <span>Missing: {(jdMatching?.missing_skills || []).length}</span>
                                <span>Extra: {(jdMatching?.extra_skills || []).length}</span>
                              </div>
                            </div>
                          )}

                          <div className="analysis-details">
                            <div className="detail-item">
                              <span className="detail-label">Version</span>
                              <span className="detail-value">v{resume.latest_analysis.version}</span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">AI Enabled</span>
                              <span className="detail-value">
                                {resume.latest_analysis.ai_enabled ? '✓ Yes' : '✗ No'}
                              </span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">Hard Score</span>
                              <span className="detail-value">{resume.latest_analysis.hard_score.toFixed(1)}%</span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">Soft Score</span>
                              <span className="detail-value">{resume.latest_analysis.soft_score.toFixed(1)}%</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="card-content">
                          <p className="no-analysis">No analysis found.</p>
                        </div>
                      )}

                      <button className="card-action" onClick={() => navigate(`/resume/${resume.id}`)}>
                        View Details →
                      </button>
                    </div>
                  )})}
                </div>

                {nextPage && (
                  <button className="load-more-btn" onClick={() => fetchResumes(nextPage)}>
                    Load More
                  </button>
                )}
              </>
            )}
          </section>
        </main>

        <footer className="history-footer">
          <button className="back-home-btn" onClick={() => navigate("/")}>
            ← Back to Upload
          </button>
          <span className="footer-text">All rights reserved by darkpheonix 444</span>
        </footer>
      </div>
    </div>
  );
}
