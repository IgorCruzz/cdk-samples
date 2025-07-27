import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/use-auth";

export default function Redirect() {
  const navigate = useNavigate();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const setRefreshToken = useAuthStore((state) => state.setRefreshToken);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");

    if (accessToken && refreshToken) {
      setAccessToken({ accessToken });
      setRefreshToken({ refreshToken });
      navigate("/home");
    } else {
      navigate("/");
    }
  }, [navigate, setAccessToken, setRefreshToken]);

  return <p>Redirecionando...</p>;
};
 