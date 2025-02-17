import "./App.css";
import Navbar from "./components/Navbar/Navbar";
import { Routes, Route } from "react-router-dom";
import Products from "./components/Products/Products";
import Auth from "./components/Login/Auth";
import { useState, useEffect } from "react";
import AddProduct from "./components/AddProduct/AddProduct";
import { auth } from "./firebaseConfig";
import Cart from "./components/Cart/Cart";
import Orders from "./components/Orders/Orders";
import AdminPage from "./components/AdminPage/AdminPage";
import AdminRoute from "./components/AdminRoute";

function App() {
  const [user, setUser] = useState(null);

  // Check Firebase auth state on app load
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    // Cleanup on unmount
  }, []);

  return (
    <>
      <Navbar user={user} setUser={setUser} />
      <Routes>
        <Route path="/" element={<Products user={user} />} />
        <Route path="/add-product" element={<AddProduct user={user} />} />
        <Route path="/auth" element={<Auth setUser={setUser} />} />
        <Route path="/cart" element={<Cart user={user} />} />
        <Route path="/order" element={<Orders />} />
        {/* <Route path="/admin/user/:id" element={<UserOrders />} /> */}
        {/* <Route path="/admin" element={<AdminPage />} /> */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminPage />
            </AdminRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
