import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../useAuth";

export default function GoogleCallbackPage() {
  const navigate = useNavigate();
  const { setAuth, refreshUser } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("accessToken");
    const userParam = params.get("user");
    let user;
    if (userParam) {
      try {
        user = JSON.parse(decodeURIComponent(userParam));
      } catch (error) {
        console.error("Failed to parse user info", error);
      }
    }
    if (accessToken) {
      setAuth({ accessToken, user });
      void refreshUser();
      navigate("/dashboard");
    }
  }, [setAuth, refreshUser, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center text-lg font-medium text-gray-700">
        Authenticating with Google...
      </div>
    </div>
  );
}
