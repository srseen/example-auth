import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../useAuth";

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <nav className="bg-gray-800 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/dashboard" className="text-xl font-bold">
              Example Auth
            </Link>
          </div>
          <div className="hidden md:flex md:items-center md:space-x-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-700"
                >
                  Dashboard
                </Link>
                <Link
                  to="/profile"
                  className="rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-700"
                >
                  Profile
                </Link>
                <button
                  onClick={() => void handleLogout()}
                  className="rounded-md bg-red-500 px-3 py-2 text-sm font-medium hover:bg-red-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-700"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="rounded-md bg-blue-500 px-3 py-2 text-sm font-medium hover:bg-blue-600"
                >
                  Register
                </Link>
              </>
            )}
          </div>
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center rounded-md p-2 hover:bg-gray-700 focus:outline-none"
            >
              <svg
                className="block h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                {menuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
      {menuOpen && (
        <div className="space-y-1 px-2 pb-3 pt-2 md:hidden">
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className="block rounded-md px-3 py-2 text-base font-medium hover:bg-gray-700"
                onClick={() => setMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                to="/profile"
                className="block rounded-md px-3 py-2 text-base font-medium hover:bg-gray-700"
                onClick={() => setMenuOpen(false)}
              >
                Profile
              </Link>
              <button
                onClick={() => {
                  void handleLogout();
                  setMenuOpen(false);
                }}
                className="block w-full rounded-md bg-red-500 px-3 py-2 text-left text-base font-medium hover:bg-red-600"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="block rounded-md px-3 py-2 text-base font-medium hover:bg-gray-700"
                onClick={() => setMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="block rounded-md bg-blue-500 px-3 py-2 text-base font-medium hover:bg-blue-600"
                onClick={() => setMenuOpen(false)}
              >
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

