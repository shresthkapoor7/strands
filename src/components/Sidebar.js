import { NavLink } from "react-router-dom";
import { useEffect } from "react";

function Sidebar({ isOpen, toggleSidebar }) {
  useEffect(() => {
    let timeoutId;
    if (isOpen) {
      timeoutId = setTimeout(() => {
        toggleSidebar();
      }, 2200);
    }
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isOpen, toggleSidebar]);

  return (
    <>
      <button className="drawer-button" onClick={toggleSidebar}>
        ☰
      </button>
      <div className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="logo">Strands</div>
        <div className="nav">
          <NavLink
            to="/home"
            className={({ isActive }) =>
              "nav-button" + (isActive ? " active" : "")
            }
            onClick={toggleSidebar}
          >
            Home
          </NavLink>

          <NavLink
            to="/threads"
            className={({ isActive }) =>
              "nav-button" + (isActive ? " active" : "")
            }
            onClick={toggleSidebar}
          >
            Threads
          </NavLink>

          <NavLink
            to="/settings"
            className={({ isActive }) =>
              "nav-button" + (isActive ? " active" : "")
            }
            onClick={toggleSidebar}
          >
            Settings
          </NavLink>
        </div>
        <div className="footer">Powered by Gemini / OpenAI</div>

        {isOpen && (
          <button className="close-sidebar" onClick={toggleSidebar}>
            ✕
          </button>
        )}
      </div>
    </>
  );
}

export default Sidebar;
