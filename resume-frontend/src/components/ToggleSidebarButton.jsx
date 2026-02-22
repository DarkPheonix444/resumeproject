import { useSidebar } from "../context/SidebarContext";
import "../styles/toggle-button.css";

export default function ToggleSidebarButton() {
  const { toggleSidebar, isOpen } = useSidebar();

  return (
    <button 
      className={`toggle-sidebar-btn ${isOpen ? 'open' : ''}`}
      onClick={toggleSidebar}
      aria-label="Toggle sidebar"
      title="Toggle sidebar"
    >
      <span className="hamburger-line"></span>
      <span className="hamburger-line"></span>
      <span className="hamburger-line"></span>
    </button>
  );
}
