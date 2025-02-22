import React, { useEffect, useState } from "react";
import "./Navbar.css";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "../../firebaseConfig";

const Navbar = () => {
  const [role, setRole] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Use onAuthStateChanged to monitor user's auth state globally
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (userCredential) => {
      if (userCredential) {
        setUser(userCredential);
        const userRef = doc(db, "users", userCredential.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          setRole(userDoc.data().role);
        } else {
          setRole(null);
        }
      } else {
        setUser(null);
        setRole(null);
      }
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  const handleLogout = async () => {
    try {
      const confirmLogout = confirm("Are you sure you want to Logout?");
      if (!confirmLogout) return;
      await signOut(auth);
      navigate("/auth");
      window.location.reload();
    } catch (error) {
      console.error("Error logging out:", error.message);
    }
  };

  return (
    <div className="navbar">
      <Link to={role === "admin" ? "/admin" : "/"} className="logo">
        QuickCart
      </Link>
      <nav className="nav-links">
        <ul>
          <li>
            <NavLink
              className="nav-link"
              to={role === "admin" ? "/admin" : "/"}
            >
              {role === "admin" ? "ADMIN DASHBOARD" : "HOME"}
            </NavLink>
          </li>
          {role === "admin" && (
            <li>
              <NavLink className="nav-link" to="/add-product">
                ADD PRODUCT
              </NavLink>
            </li>
          )}
          {role === "admin" && (
            <li>
              <NavLink className="nav-link" to="/">
                PRODUCTS
              </NavLink>
            </li>
          )}

          {role !== "admin" && user && (
            <li>
              <NavLink className="nav-link" to="/cart">
                CART
              </NavLink>
            </li>
          )}
          {role !== "admin" && user && (
            <li>
              <NavLink className="nav-link" to="/order">
                ORDERS
              </NavLink>
            </li>
          )}
        </ul>
      </nav>
      <div>
        {user ? (
          <p onClick={handleLogout} className="nav-btn">
            Logout
          </p>
        ) : (
          <Link to="/auth" className="nav-btn">
            Login
          </Link>
        )}
      </div>
    </div>
  );
};

export default Navbar;
