import React, { useState } from "react";
import "./Auth.css";
import { auth, db } from "../../firebaseConfig";
import { useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

const Auth = ({ setUser }) => {
  const [toShow, setToShow] = useState("login");
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    login: { email: "", password: "" },
    register: { email: "", password: "", confirmPassword: "" },
  });

  const [error, setError] = useState("");

  const handleChange = (e, type) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [name]: value,
      },
    }));
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    const { email, password, confirmPassword } = formData.register;

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    try {
      setError("");
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        cart: [],
      });

      setUser(user);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = formData.login;

    try {
      setError("");
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      setUser(userCredential.user);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <div className="auth-toggle">
          <button
            onClick={() => setToShow("login")}
            className={toShow === "login" ? "active" : ""}
          >
            Login
          </button>
          <button
            onClick={() => setToShow("register")}
            className={toShow === "register" ? "active" : ""}
          >
            Register
          </button>
        </div>

        {toShow === "login" && (
          <div className="auth-form login-form">
            <h2>Login</h2>
            {error && <p className="error-message">{error}</p>}
            <form onSubmit={handleLoginSubmit}>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.login.email}
                  onChange={(e) => handleChange(e, "login")}
                  required
                />
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.login.password}
                  onChange={(e) => handleChange(e, "login")}
                  required
                />
              </div>
              <button type="submit" className="auth-btn">
                Login
              </button>
            </form>
          </div>
        )}

        {toShow === "register" && (
          <div className="auth-form register-form">
            <h2>Register</h2>
            {error && <p className="error-message">{error}</p>}
            <form onSubmit={handleRegisterSubmit}>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.register.email}
                  onChange={(e) => handleChange(e, "register")}
                  required
                />
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.register.password}
                  onChange={(e) => handleChange(e, "register")}
                  required
                />
                <label>Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.register.confirmPassword}
                  onChange={(e) => handleChange(e, "register")}
                  required
                />
              </div>
              <button type="submit" className="auth-btn">
                Register
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;
