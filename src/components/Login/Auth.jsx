import React, { useState } from "react";
import "./Auth.css";
import { auth, db } from "../../firebaseConfig";
import { useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";

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

      await setDoc(
        doc(db, "users", user.uid),
        {
          email: user.email,
          isBlocked: false,
          role: "user",
          cart: [],
        },
        { merge: true }
      );

      setUser(user);
      setFormData({
        login: { email: "", password: "" },
        register: { email: "", password: "", confirmPassword: "" },
      });
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message);
    }
  };

  // const handleLoginSubmit = async (e) => {
  //   e.preventDefault();
  //   const { email, password } = formData.login;

  //   try {
  //     setError("");
  //     const userCredential = await signInWithEmailAndPassword(
  //       auth,
  //       email,
  //       password
  //     );
  //     setUser(userCredential.user);

  //     const userRef = doc(db, "users", userCredential.user.uid);
  //     const userDoc = await getDoc(userRef);

  //     if (userDoc.exists()) {
  //       const userData = userDoc.data();

  //       // If user is blocked, log them out and show an error message
  //       if (userData.isBlocked) {
  //         await signOut(auth);
  //         setError("Your account is blocked by Admin.");
  //       } else {
  //         // Reset form data after successful login
  //         setFormData({
  //           login: { email: "", password: "" },
  //           register: { email: "", password: "", confirmPassword: "" },
  //         });
  //         navigate("/", { replace: true });
  //       }
  //     } else {
  //       setError("User data not found.");
  //     }
  //   } catch (err) {
  //     setError(err.message);
  //   }
  // };

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
      const user = userCredential.user;

      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();

        // If user is blocked, log them out and show an error message
        if (userData.isBlocked) {
          await signOut(auth);
          setError("Your account is blocked by Admin.");
          return;
        }

        // Set the user state
        setUser(user);

        // Navigate based on role
        if (userData.role === "admin") {
          navigate("/admin", { replace: true }); // Redirect admin to admin dashboard
        } else {
          navigate("/", { replace: true }); // Redirect regular users to homepage
        }

        // Reset form data after successful login
        setFormData({
          login: { email: "", password: "" },
          register: { email: "", password: "", confirmPassword: "" },
        });
      } else {
        setError("User data not found.");
      }
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
