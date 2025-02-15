// import "./App.css";
// import Navbar from "./components/Navbar/Navbar";
// import { Routes, Route } from "react-router-dom";
// import Products from "./components/Products/Products";
// import Auth from "./components/Login/Auth";
// import { useState } from "react";
// import AddProduct from "./components/AddProduct/AddProduct";

// function App() {
//   const [user, setUser] = useState("");

//   return (
//     <>
//       <Navbar />
//       <Routes user={user} setUser={setUser}>
//         <Route path="/" exact element={<Products />} />
//         <Route path="/add-product" exact element={<AddProduct />} />
//         <Route path="/auth" exact element={<Auth setUser={setUser} />} />
//       </Routes>
//     </>
//   );
// }

// export default App;
import "./App.css";
import Navbar from "./components/Navbar/Navbar";
import { Routes, Route } from "react-router-dom";
import Products from "./components/Products/Products";
import Auth from "./components/Login/Auth";
import { useState, useEffect } from "react";
import AddProduct from "./components/AddProduct/AddProduct";
import { auth } from "./firebaseConfig";
import Cart from "./components/Cart/Cart";

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
      </Routes>
    </>
  );
}

export default App;
