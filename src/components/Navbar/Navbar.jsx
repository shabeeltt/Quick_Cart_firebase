import React from "react";
import "./Navbar.css";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../firebaseConfig";

const Navbar = ({ user }) => {
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      const confirmLogout = confirm("Are you sure you want to Logout?");
      if (!confirmLogout) return;

      navigate("/auth");
      await signOut(auth);
    } catch (error) {
      console.error("Error logging out:", error.message);
    }
  };

  return (
    <div className="navbar">
      <Link to="/" className="logo">
        QuickCart
      </Link>
      <nav className="nav-links">
        <ul>
          <li>
            <NavLink className="nav-link" to="/">
              HOME
            </NavLink>
          </li>
          {user && (
            <li>
              <NavLink className="nav-link" to="/add-product">
                ADD PRODUCT
              </NavLink>
            </li>
          )}
          {user && (
            <li>
              <NavLink className="nav-link" to="/cart">
                CART
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
