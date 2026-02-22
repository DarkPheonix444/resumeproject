import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import api from "../api/axios";
import "../styles/comparison.css";

export default function HistoryComparison({ currentScore }) {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistoryData();
  }, []);

  const fetchHistoryData = async () => {
    try {
      setLoading(true);
      const response = await api.get("/resume-analysis/analyses/");
      
      let analyses = response.data.results || response.data;
      if (!Array.isArray(analyses)) {
        analyses = [];
      }

      // Sort by creation date and limit to last 5
      const sorted = analyses
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);

      setHistoryData(sorted);
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="comparison-loading">Loading history data...</div>;
  }

  if (historyData.length === 0) {
    return (
      <div className="comparison-empty">
        <p>No previous analyses. Upload your first resume to see comparisons!</p>
      </div>
    );
  }

  // Prepare comparison data
  const comparisonData = historyData.map((item, index) => ({
    name: `v${item.version}`,
    score: item.total_score,
    hardScore: item.hard_score,
    softScore: item.soft_score,
  }));

  if (currentScore) {
    comparisonData.unshift({
      name: "Current",
      score: currentScore.total,
      hardScore: currentScore.rule,
      softScore: currentScore.semantic,
    });
  }

  return (
    <div className="comparison-container">
      <div className="comparison-header">
        <h3>📊 Resume Score Comparison</h3>
        <p className="comparison-subtitle">Current upload vs. Previous analyses</p>
      </div>

      <div className="comparison-charts">
        {/* Overall Score Trend */}
        <div className="chart-wrapper">
          <h4>Overall Score Trend</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151" }}
                labelStyle={{ color: "#fff" }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: "#3b82f6", r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Score Breakdown Comparison */}
        <div className="chart-wrapper">
          <h4>Score Breakdown Comparison</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151" }}
                labelStyle={{ color: "#fff" }}
              />
              <Legend />
              <Bar dataKey="hardScore" fill="#8b5cf6" name="Rule-based" />
              <Bar dataKey="softScore" fill="#06b6d4" name="AI Semantic" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="comparison-stats">
        <div className="stat-card">
          <span className="stat-label">Total Analyses</span>
          <span className="stat-value">{historyData.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Highest Score</span>
          <span className="stat-value">
            {Math.max(...historyData.map((h) => h.total_score), currentScore?.total || 0).toFixed(1)}
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Average Score</span>
          <span className="stat-value">
            {(
              historyData.reduce((sum, h) => sum + h.total_score, currentScore?.total || 0) /
              (historyData.length + (currentScore ? 1 : 0))
            ).toFixed(1)}
          </span>
        </div>
      </div>
    </div>
  );
}
