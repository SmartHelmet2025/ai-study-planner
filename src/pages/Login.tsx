import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

// ✅ BACKGROUND IMAGE
import bgImage from "../assets/login-bg.png";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔐 EMAIL LOGIN
  const handleLogin = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;

      navigate("/dashboard");
    } catch (err: any) {
      alert(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  // 🔵 GOOGLE LOGIN
  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin + "/dashboard",
        },
      });

      if (error) throw error;
    } catch (err: any) {
      alert(err.message);
    }
  };

  // 🔁 FORGOT PASSWORD
  const handleForgotPassword = async () => {
    if (!email) return alert("Please enter your email first");

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: window.location.origin + "/reset-password",
        }
      );

      if (error) throw error;

      alert("Check your email for reset link");
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-100">

      {/* LEFT SIDE (IMAGE PANEL) */}
      <div
        className="relative flex-1 m-6 rounded-3xl text-white flex flex-col justify-between p-10 overflow-hidden"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* DARK OVERLAY */}
        <div className="absolute inset-0 bg-black/50 rounded-3xl"></div>

        {/* TOP CONTENT */}
        <div className="relative flex justify-between items-center">
          <h2 className="text-3xl font-bold">StudyPlanner AI</h2>

          <div className="flex gap-3">
            <button className="text-sm">Help</button>
            <button className="border px-4 py-2 rounded-full hover:bg-white hover:text-black transition">
              Get Started
            </button>
          </div>
        </div>

        {/* BOTTOM USER */}
        <div className="relative flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center text-xl">
            👩‍🎓
          </div>

          <div>
            <h3 className="font-semibold">Smart Student</h3>
            <p className="text-sm text-gray-200">
              AI Productivity System
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE (FORM) */}
      <div className="w-[45%] bg-white flex items-center justify-center rounded-l-3xl shadow-lg">

        <div className="w-full max-w-md p-10">

          {/* TITLE */}
          <h1 className="text-5xl font-extrabold mb-2">LOGIN</h1>
          <p className="text-gray-500 mb-8">
            Login to continue your AI study journey
          </p>

          {/* INPUTS */}
          <div className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 border rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-200"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="w-full p-4 border rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-200"
            />
          </div>

          {/* FORGOT PASSWORD */}
          <div
            onClick={handleForgotPassword}
            className="text-right text-purple-600 text-sm mt-3 cursor-pointer"
          >
            Forgot password?
          </div>

          {/* DIVIDER */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-300"></div>
            <p className="text-gray-400 text-sm">or</p>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          {/* GOOGLE LOGIN */}
          <button
            onClick={handleGoogleLogin}
            className="w-full border py-4 rounded-xl hover:bg-gray-50 transition mb-4"
          >
            Login with Google
          </button>

          {/* LOGIN BUTTON */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-4 rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white font-bold hover:opacity-90 transition"
          >
            {loading ? "Loading..." : "Login"}
          </button>

          {/* REGISTER LINK */}
          <p className="text-center text-gray-500 mt-6">
            Don’t have an account?
            <Link
              className="text-purple-600 ml-1 font-semibold"
              to="/register"
            >
              Sign up
            </Link>
          </p>

        </div>
      </div>

    </div>
  );
}