import React, { useEffect, useState } from "react";
import { db } from "../../firebaseConfig"; // Firebase configuration file
import { collection, getDocs, doc, updateDoc } from "firebase/firestore"; // Firestore methods
import "./AdminPage.css";

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedUserId, setExpandedUserId] = useState(null); // Track expanded user
  const [userOrders, setUserOrders] = useState({}); // Store orders for each user

  // Fetch users data from Firestore
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
        setLoading(false);
      } catch (error) {
        console.error("Error fetching users: ", error);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Fetch orders for a user when expanded
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
        [userId]: ordersList, // Save orders for the specific user
      }));
    } catch (error) {
      console.error("Error fetching orders: ", error);
    }
  };

  // Toggle the user's isBlocked status
  const toggleBlockStatus = async (userId, currentStatus) => {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        isBlocked: !currentStatus, // Toggle the current status
      });
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, isBlocked: !currentStatus } : user
        )
      );
    } catch (error) {
      console.error("Error updating user status: ", error);
    }
  };

  // Handle toggle of orders visibility
  const handleToggleOrders = (userId) => {
    if (expandedUserId === userId) {
      // If the same user is clicked, collapse the orders section
      setExpandedUserId(null);
    } else {
      // Expand the orders section for the clicked user
      setExpandedUserId(userId);
      // Fetch the orders only if they haven't been fetched yet
      if (!userOrders[userId]) {
        fetchOrders(userId);
      }
    }
  };

  return (
    <>
      <h1>Users</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="user-cards-container">
          {users.map((user) => (
            <div key={user.id} className="user-card">
              <div className="user-info">
                <p className="user-email">
                  {user.email} {user.role === "admin" && "(Admin)"}
                </p>

                {/* Blocked/Active status */}
                <p className="user-status">
                  Status:{" "}
                  <p
                    style={{
                      color: user.isBlocked ? "#e74c3c" : "#27ae60",
                      fontWeight: "bold",
                    }}
                  >
                    {user.isBlocked ? "Blocked" : "Active"}
                  </p>
                </p>

                {/* Action buttons to Block or Unblock */}
                <button
                  className="user-action-btn"
                  onClick={() => toggleBlockStatus(user.id, user.isBlocked)}
                >
                  {user.isBlocked ? "Unblock" : "Block"}
                </button>
              </div>

              {/* Orders Section (toggle visibility) */}
              <div className="user-orders">
                <button
                  onClick={() => handleToggleOrders(user.id)}
                  className="toggle-orders-btn"
                >
                  {expandedUserId === user.id ? "Hide Orders" : "Show Orders"}
                </button>

                {expandedUserId === user.id && (
                  <OrdersList orders={userOrders[user.id] || []} />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

const OrdersList = ({ orders }) => {
  return (
    <div className="order-list">
      {orders.length > 0 ? (
        orders.map((order, index) => (
          <div key={order.id} className="order-card">
            <div className="order-summary">
              <h2>Order No: {index + 1}</h2>
              <p className="order-status">Status: {order.status}</p>
              <p>Order Date: {order.time.toDate().toLocaleDateString()}</p>
              <p className="order-price">{order.total} Rs</p>
            </div>
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
          </div>
        ))
      ) : (
        <p>No orders found for this user.</p>
      )}
    </div>
  );
};

export default AdminPage;
