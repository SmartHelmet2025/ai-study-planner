import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuth = async () => {
      const { data } = await supabase.auth.getSession();

      if (data.session) {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    };

    handleAuth();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-gray-600">Signing you in...</p>
    </div>
  );
}