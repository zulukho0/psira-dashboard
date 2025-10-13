import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const NavLink = ({ to, children }) => {
  const location = useLocation();
  const isActive = location.pathname.startsWith(to);
  return (
    <Link
      to={to}
      className={`px-3 py-2 rounded-md text-sm font-medium ${
        isActive ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-200"
      }`}
    >
      {children}
    </Link>
  );
};

export default function Navbar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Try to get username from context or localStorage
  const storedUser =
    JSON.parse(localStorage.getItem("user")) ||
    localStorage.getItem("username") ||
    "User";

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <header className="w-full bg-white shadow">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="font-bold text-lg text-blue-700">PSIRA Connect</div>

        <nav className="flex gap-2">
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/students">Students</NavLink>
        </nav>

        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            👋 {storedUser ? storedUser : "Welcome"}
          </span>
          <button
            onClick={handleLogout}
            className="px-3 py-2 bg-gray-100 rounded-md hover:bg-gray-200 text-sm"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
