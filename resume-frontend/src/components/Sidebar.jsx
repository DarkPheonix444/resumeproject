import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSidebar } from "../context/SidebarContext";
import api from "../api/axios";
import "../styles/sidebar.css";

export default function Sidebar() {
  const [userName, setUserName] = useState("User");
  const navigate = useNavigate();
  const { isOpen, closeSidebar } = useSidebar();

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const response = await api.get("/users/me/");
        setUserName(response.data.name || response.data.email || "User");
      } catch (error) {
        console.error("Failed to fetch user name:", error);
      }
    };
    fetchUserName();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    closeSidebar();
    navigate("/login");
  };

  const handleNavigation = (path) => {
    navigate(path);
    closeSidebar();
  };

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={closeSidebar}></div>}
      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-title">Resume Scanner</h2>
        </div>

        <div className="sidebar-user">
          <div className="user-avatar">{userName.charAt(0).toUpperCase()}</div>
          <div className="user-info">
            <p className="user-name">{userName}</p>
            <p className="user-label">User</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button 
            className="nav-item"
            onClick={() => handleNavigation("/")}
          >
            <span className="nav-icon">📄</span>
            <span className="nav-label">Upload Resume</span>
          </button>
          
          <button 
            className="nav-item"
            onClick={() => handleNavigation("/history")}
          >
            <span className="nav-icon">📊</span>
            <span className="nav-label">History</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
