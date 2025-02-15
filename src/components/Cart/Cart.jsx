import React, { useState, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import "./Cart.css";
import Loader from "../Loader";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { auth } from "../../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

const Cart = ({ user }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();

  const showAlert = () => {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Please login frist cart!!",
    });
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        showAlert();
        navigate("/auth");
      }
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);

  useEffect(() => {
    if (cartItems.length > 0) {
      const newTotal = cartItems.reduce(
        (sum, item) => sum + item.price * item.count,
        0
      );
      setTotal(newTotal);
    } else {
      setTotal(0);
    }
  }, [cartItems]);

  // Fetch cart items from Firestore
  useEffect(() => {
    if (!user) return;

    const fetchCart = async () => {
      try {
        const userCartRef = doc(db, "users", user.uid);
        const cartSnapshot = await getDoc(userCartRef);

        if (cartSnapshot.exists()) {
          const cartData = cartSnapshot.data().cart || [];
          setCartItems(cartData);
        }
      } catch (error) {
        console.error("Error fetching cart:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [user]);

  // Update cart in Firestore
  const updateCartInFirestore = async (updatedCart) => {
    if (!user) return;

    try {
      const userCartRef = doc(db, "users", user.uid);
      await updateDoc(userCartRef, { cart: updatedCart });
    } catch (error) {
      console.error("Error updating cart:", error);
    }
  };

  // Handle quantity change
  const updateItemCount = (productId, change) => {
    const updatedCart = cartItems.map((item) =>
      item.id === productId
        ? { ...item, count: Math.max(1, (item.count || 1) + change) }
        : item
    );
    setCartItems(updatedCart);
    updateCartInFirestore(updatedCart);
  };

  //remove from cart function
  const handleRemoveFromCart = async (productId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to remove this item from cart?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Remove the item",
      cancelButtonText: "No, cancel",
    }).then(async (result) => {
      if (result.isConfirmed && user) {
        try {
          const updatedCart = cartItems.filter((item) => item.id !== productId);
          setCartItems(updatedCart);
          updateCartInFirestore(updatedCart);
          Swal.fire(
            "Item Removed!",
            "Item has been removed from the cart successfully.",
            "success"
          );
        } catch (error) {
          console.error("Error clearing cart:", error);
        }
      }
    });
  };

  //function to perform buy now
  const handleBuyNow = async () => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to place the order?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, place order",
      cancelButtonText: "No, cancel",
    }).then(async (result) => {
      if (result.isConfirmed && user) {
        try {
          const userCartRef = doc(db, "users", user.uid);
          await updateDoc(userCartRef, { cart: [] }); // remove cart of user from firestore
          setCartItems([]); // clear the cart to show in ui
          Swal.fire(
            "Order Placed!",
            "Your order has been placed successfully.",
            "success"
          );
        } catch (error) {
          console.error("Error clearing cart:", error);
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <Loader />
        <p className="message">Loading cart...</p>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1>Your Cart</h1>
      {cartItems.length > 0 ? (
        <div className="cart-items">
          {cartItems.map((item) => (
            <div key={item.id} className="cart-item">
              <div className="cart-item-details">
                <h3>{item.name}</h3>
                <p>Price: {item.price} Rs</p>
                <div className="counter-container">
                  <button
                    className="counter-btn"
                    onClick={() => updateItemCount(item.id, -1)}
                    disabled={item.count <= 1}
                  >
                    -
                  </button>
                  <span className="counter-value">{item.count || 1}</span>
                  <button
                    className="counter-btn"
                    onClick={() => updateItemCount(item.id, 1)}
                  >
                    +
                  </button>
                </div>
                <button
                  className="remove-btn"
                  onClick={() => handleRemoveFromCart(item.id)}
                >
                  Remove from Cart
                </button>
              </div>
            </div>
          ))}
          <h2>Total: {total} Rs</h2>
          <button onClick={handleBuyNow}>Buy Now</button>
        </div>
      ) : (
        <p className="message">Your cart is empty.</p>
      )}
    </div>
  );
};

export default Cart;
