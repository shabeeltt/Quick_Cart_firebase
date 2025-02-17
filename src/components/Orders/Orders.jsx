import React, { useEffect, useState } from "react";
import "./Order.css";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../firebaseConfig";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { collection, getDocs } from "firebase/firestore";
import Loader from "../Loader";

const Orders = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [show, setShow] = useState(true);
  const [ordersData, setOrdersData] = useState([]); // State to hold the fetched orders
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [loading, setLoading] = useState(true);

  const showAlert = () => {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Please login first !!",
    });
  };

  const toggleOrderDetails = (orderId) => {
    if (selectedOrderId === orderId) {
      setSelectedOrderId(null); // Collapse the order if it's already selected
      setShow(true);
    } else {
      setSelectedOrderId(orderId); // Expand the order
      setShow(false);
    }
  };

  // Fetch orders data from Firestore
  useEffect(() => {
    if (!user) return; // If the user is not authenticated, don't fetch orders.

    const fetchOrders = async () => {
      try {
        const userOrderRef = collection(db, "users", user.uid, "orders");
        const orderSnapshot = await getDocs(userOrderRef);

        if (!orderSnapshot.empty) {
          const fetchedOrders = orderSnapshot.docs.map((doc) => ({
            orderId: doc.id,
            ...doc.data(),
          }));
          setOrdersData(fetchedOrders); // Set the fetched orders in state
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders(); // Call the fetch function when the user is authenticated
  }, [user]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        showAlert();
        navigate("/auth", { replace: true });
      } else {
        setUser(currentUser); // Set the user when authenticated
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="loading-screen">
        <Loader />
        <p className="message">Loading Orders...</p>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <h1>Your Orders</h1>
      {ordersData.length > 0 ? (
        <div className="order-list">
          {ordersData.map((order, index) => (
            <div key={order.orderId} className="order-card">
              <div
                className="order-summary"
                onClick={() => toggleOrderDetails(order.orderId)}
              >
                <h2>Order No: {index + 1}</h2>
                <p className="order-status">Status: {order.status}</p>
                <p>Order Date: {order.time.toDate().toLocaleDateString()}</p>
                {show && <p className="order-price">{order.total} Rs</p>}
              </div>

              {selectedOrderId === order.orderId && (
                <div className="order-details">
                  <h3>Items:</h3>
                  <ul>
                    {order.items.map((item) => (
                      <li key={item.id}>
                        <p>Name: {item.name}</p>
                        <p>Price: {item.price} Rs</p>
                        <p>Quantity: {item.count}</p>
                        <p>Total: {item.price * item.count} Rs</p>
                      </li>
                    ))}
                  </ul>
                  <h3 className="order-price">Amount: {order.total} Rs</h3>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="message">You don't have any orders yet.</p>
      )}
    </div>
  );
};

export default Orders;
