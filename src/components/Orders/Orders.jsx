import React, { useEffect, useState } from "react";
import "./Order.css";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../firebaseConfig";
import {
  doc,
  collection,
  getDocs,
  updateDoc,
  setDoc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Loader from "../Loader";

const Orders = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [show, setShow] = useState(true);
  const [ordersData, setOrdersData] = useState([]);
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
    setSelectedOrderId(selectedOrderId === orderId ? null : orderId);
    setShow(selectedOrderId !== orderId);
  };

  const fetchOrders = async () => {
    try {
      const userOrderRef = collection(db, "users", user.uid, "orders");
      const orderSnapshot = await getDocs(userOrderRef);

      if (!orderSnapshot.empty) {
        const fetchedOrders = orderSnapshot.docs.map((doc) => ({
          orderId: doc.id,
          ...doc.data(),
        }));
        setOrdersData(fetchedOrders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (user, orderId) => {
    Swal.fire({
      title: "Do you want to cancel the order?",
      text: "You won't be able to revert this action.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
    }).then(async (result) => {
      if (result.isConfirmed && user) {
        try {
          const orderRef = doc(db, "users", user.uid, "orders", orderId);

          await updateDoc(orderRef, { status: "cancelled" });
          Swal.fire(
            "Order cancelled!",
            "Order has been cancelled successfully.",
            "success"
          );
          fetchOrders();
        } catch (error) {
          console.error("Error Cancelling the order:", error);
        }
      }
    });
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        showAlert();
        navigate("/auth", { replace: true });
      } else {
        setUser(currentUser);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) fetchOrders();
  }, [user]);

  if (loading) {
    return (
      <div className="loading-screen">
        <Loader />
        <p className="message">Loading Orders...</p>
      </div>
    );
  }

  const activeOrders = ordersData.filter(
    (order) => order.status !== "cancelled"
  );
  const cancelledOrders = ordersData.filter(
    (order) => order.status === "cancelled"
  );

  return (
    <div className="orders-page">
      <h1>Your Orders</h1>

      {ordersData.length > 0 ? (
        <div className="orders-container">
          {/* Active Orders Section */}
          <div className="orders-section">
            <h2>Active Orders</h2>
            {activeOrders.length > 0 ? (
              activeOrders.map((order, index) => (
                <div key={order.orderId} className="order-card">
                  <div
                    className="order-summary"
                    onClick={() => toggleOrderDetails(order.orderId)}
                  >
                    <h3>Order No: {index + 1}</h3>
                    <p>Status: {order.status}</p>
                    <p>
                      Order Date: {order.time.toDate().toLocaleDateString()}
                    </p>
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

                  {order.status === "delivered" ? (
                    <p style={{ textAlign: "center", color: "green" }}>
                      Delivered
                    </p>
                  ) : (
                    <button
                      onClick={() => handleCancelOrder(user, order.orderId)}
                      style={{ backgroundColor: "orangered" }}
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p style={{ textAlign: "center" }}>No active orders.</p>
            )}
          </div>

          {/* Cancelled Orders Section */}
          <div className="orders-section">
            <h2>Cancelled Orders</h2>
            {cancelledOrders.length > 0 ? (
              cancelledOrders.map((order, index) => (
                <div key={order.orderId} className="order-card cancelled">
                  <div className="order-summary">
                    <h3>Order No: {index + 1}</h3>
                    <p>Status: {order.status}</p>
                    <p>
                      Order Date: {order.time.toDate().toLocaleDateString()}
                    </p>
                    <p className="order-price">{order.total} Rs</p>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ textAlign: "center" }}>No cancelled orders.</p>
            )}
          </div>
        </div>
      ) : (
        <p className="message">You don't have any orders yet.</p>
      )}
    </div>
  );
};

export default Orders;
