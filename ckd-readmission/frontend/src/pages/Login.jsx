import { useState } from "react";
import { supabase } from "../services/supabaseClient";
import "./Login.css";

export default function Login({ onAuthSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (isRegister && !fullName.trim()) {
      errs.fullName = "Full name is required";
    }
    if (!email.trim() || !email.includes("@")) {
      errs.email = "Please enter a valid email address";
    }
    if (!password || password.length < 6) {
      errs.password = "Password must be at least 6 characters";
    }
    if (isRegister && password !== confirmPassword) {
      errs.confirmPassword = "Passwords do not match";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    if (!validate()) return;

    setLoading(true);
    try {
      if (isRegister) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
          },
        });
        if (error) throw error;

        const userId = data?.user?.id;
        if (userId) {
          // Insert row into patient_profiles table
          const { error: profileError } = await supabase
            .from("patient_profiles")
            .upsert({
              user_id: userId,
              full_name: fullName,
              age: 45,
              sex: "Male",
              contact_number: "",
            });

          if (profileError) {
            console.warn("Profile insert warning:", profileError.message);
          }
        }
        if (onAuthSuccess) onAuthSuccess(data?.session || data?.user);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        if (onAuthSuccess) onAuthSuccess(data?.session || data?.user);
      }
    } catch (err) {
      setErrors({ auth: err.message || "Authentication failed. Please check your credentials." });
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegister(!isRegister);
    setErrors({});
  };

  return (
    <div className="auth-wrapper">
      <div className="bg-grid" />
      <div className="bg-glow" />

      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-brand-mark">CKD</div>
          <h1 className="auth-title">
            {isRegister ? "Create your account" : "Sign in to your workspace"}
          </h1>
          <p className="auth-subtitle">
            {isRegister
              ? "Register to access your personal renal review workspace"
              : "Enter your credentials to access your assessment workspace"}
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {isRegister && (
            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <input
                id="fullName"
                type="text"
                className="glass-input"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
              {errors.fullName && <div className="inline-error">{errors.fullName}</div>}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              className="glass-input"
              placeholder="patient@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && <div className="inline-error">{errors.email}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="glass-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {errors.password && <div className="inline-error">{errors.password}</div>}
          </div>

          {isRegister && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                className="glass-input"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {errors.confirmPassword && (
                <div className="inline-error">{errors.confirmPassword}</div>
              )}
            </div>
          )}

          {errors.auth && <div className="inline-error" style={{ textAlign: "center" }}>{errors.auth}</div>}

          <button type="submit" className="btn-auth-primary" disabled={loading}>
            {loading ? "Processing…" : isRegister ? "Create Account" : "Sign In"}
          </button>
        </form>

        <div className="auth-toggle-link">
          {isRegister ? "Already have an account? " : "Don't have an account? "}
          <button type="button" className="auth-toggle-btn" onClick={toggleMode}>
            {isRegister ? "Sign in" : "Register"}
          </button>
        </div>
      </div>
    </div>
  );
}
