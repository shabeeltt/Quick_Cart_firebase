import React, { useEffect, useState } from "react";
import { db } from "../../firebaseConfig"; // Firebase config
import { collection, getDocs, doc, updateDoc } from "firebase/firestore"; // Firestore methods
import "./AdminPage.css";

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [expandedUserId, setExpandedUserId] = useState(null);
  const [userOrders, setUserOrders] = useState({});

  // Fetch users from Firestore
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollection = collection(db, "users");
        const usersSnapshot = await getDocs(usersCollection);
        const usersList = usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(usersList);
      } catch (error) {
        console.error("Error fetching users: ", error);
      }
    };

    fetchUsers();
  }, []);

  // Fetch orders for a specific user
  const fetchOrders = async (userId) => {
    try {
      const ordersCollection = collection(db, "users", userId, "orders");
      const ordersSnapshot = await getDocs(ordersCollection);
      const ordersList = ordersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUserOrders((prevOrders) => ({
        ...prevOrders,
        [userId]: ordersList,
      }));
    } catch (error) {
      console.error("Error fetching orders: ", error);
    }
  };

  // Handle order status update
  const handleStatusChange = async (userId, orderId, newStatus) => {
    try {
      const orderRef = doc(db, "users", userId, "orders", orderId);
      await updateDoc(orderRef, { status: newStatus });

      // Update UI after Firestore update
      setUserOrders((prevOrders) => ({
        ...prevOrders,
        [userId]: prevOrders[userId].map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        ),
      }));
    } catch (error) {
      console.error("Error updating order status: ", error);
    }
  };

  // Toggle user orders section
  const handleToggleOrders = (userId) => {
    if (expandedUserId === userId) {
      setExpandedUserId(null);
    } else {
      setExpandedUserId(userId);
      if (!userOrders[userId]) {
        fetchOrders(userId);
      }
    }
  };

  return (
    <>
      <h1>Users</h1>
      <div className="user-cards-container">
        {users.map((user) => (
          <div key={user.id} className="user-card">
            <div className="user-info">
              <p className="user-email">
                {user.email} {user.role === "admin" && "(Admin)"}
              </p>
            </div>

            {/* Toggle Orders Button */}
            <div className="user-orders">
              <button
                onClick={() => handleToggleOrders(user.id)}
                className="toggle-orders-btn"
              >
                {expandedUserId === user.id ? "Hide Orders" : "Show Orders"}
              </button>

              {/* Orders Section */}
              {expandedUserId === user.id && (
                <OrdersList
                  orders={userOrders[user.id] || []}
                  userId={user.id}
                  onStatusChange={handleStatusChange}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

// Orders List Component
const OrdersList = ({ orders, userId, onStatusChange }) => {
  return (
    <div className="order-list">
      {orders.length > 0 ? (
        orders.map((order, index) => (
          <div key={order.id} className="order-card">
            <div className="order-summary">
              <div className="top-section">
                <h2>Order No: {index + 1}</h2>

                {/* Order Status Dropdown */}
                <select
                  name="status"
                  id="status"
                  className={`order-status-dropdown ${order.status}`}
                  value={order.status}
                  onChange={(e) =>
                    onStatusChange(userId, order.id, e.target.value)
                  }
                >
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="delivered">Delivered</option>
                </select>
              </div>

              <p className="order-status">Status: {order.status}</p>
              <p>Order Date: {order.time.toDate().toLocaleDateString()}</p>
              <p className="order-price">{order.total} Rs</p>
            </div>
          </div>
        ))
      ) : (
        <p>No orders found for this user.</p>
      )}
    </div>
  );
};

export default AdminPage;
