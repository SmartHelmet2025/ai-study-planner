import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

// 📸 image (make sure file exists in /src/assets/)
import myImage from "../assets/register-bg.png";

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // 🧾 REGISTER EMAIL
  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      alert("Please fill all fields");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: name,
          },
          emailRedirectTo: window.location.origin + "/",
        },
      });

      if (error) throw error;

      alert("✅ Account created! Check your email to confirm.");
      navigate("/");
    } catch (err: any) {
      alert(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  // 🔵 GOOGLE REGISTER
  const handleGoogleRegister = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin + "/auth/callback",
        },
      });

      if (error) throw error;
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="register-page">

      {/* LEFT SIDE */}
      <div
        className="register-left"
        style={{
          backgroundImage: `url(${myImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="overlay"></div>

        <div className="left-content">
          <div className="top-left">
            <h2>StudyPlanner AI</h2>
          </div>

          <div className="bottom-user">
            <div className="avatar">🤖</div>
            <div>
              <h3>AI Productivity</h3>
              <p>Next Generation Learning</p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="register-right">
        <div className="register-card">

          <h1>Create Account</h1>
          <p>Start your AI-powered learning journey</p>

          {/* INPUTS */}
          <div className="input-group">
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {/* NOTE */}
          <div className="forgot-password">
            Password must be at least 6 characters
          </div>

          {/* DIVIDER */}
          <div className="divider">
            <span></span>
            <p>or</p>
            <span></span>
          </div>

          {/* GOOGLE */}
          <button
            className="google-btn"
            onClick={handleGoogleRegister}
            disabled={loading}
          >
            Continue with Google
          </button>

          {/* REGISTER */}
          <button
            className="register-btn"
            onClick={handleRegister}
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

          {/* LOGIN LINK */}
          <div className="login-link">
            Already have an account?
            <Link to="/">Login</Link>
          </div>

          {/* SOCIALS */}
          <div className="socials">
            <span>🌐</span>
            <span>📘</span>
            <span>📸</span>
            <span>💼</span>
          </div>

        </div>
      </div>

    </div>
  );
}