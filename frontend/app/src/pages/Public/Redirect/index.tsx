import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/use-auth";

export default function Redirect() {
  const navigate = useNavigate();
  const setTokens = useAuthStore((state) => state.setTokens);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");

    if (accessToken && refreshToken) { 
      setTokens({ accessToken, refreshToken }); 
    } else {
      navigate("/");
    }
  }, [navigate, setTokens]);

  return <p>Redirecionando...</p>;
};
 