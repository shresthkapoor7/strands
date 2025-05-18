import { NavLink } from "react-router-dom";

function Sidebar({ isOpen, toggleSidebar }) {
  return (
    <>
      <button className="drawer-button" onClick={toggleSidebar}>
        ☰
      </button>
      <div className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="logo">Strands</div>
        <div className="nav">
          <NavLink
            to="/"
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
