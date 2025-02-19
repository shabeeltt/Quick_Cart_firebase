import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../firebaseConfig";
import "./ProductsCards.css";
import Loader from "../Loader";
import Swal from "sweetalert2";
import EditPopup from "../EditPopup/EditPopup";

const ProductsCards = ({ user }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState([]); // Store user's cart items
  const [userRole, setUserRole] = useState(null); // To store user role (admin or user)
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const showAlert = () => {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Please login first!!",
    }).then(() => navigate("/auth"));
  };

  const showSuccessMessage = (product) => {
    Swal.fire({
      title: `${product.name} added to cart!`,
      icon: "success",
    });
  };

  // Fetch products from Firestore
  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "products"));
      const productList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(productList);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchProducts();
  }, []);

  // Fetch the cart from Firestore of the particular user to check if product is already in the cart or not.
  useEffect(() => {
    if (user) {
      const fetchCart = async () => {
        const userCartRef = doc(db, "users", user.uid);
        const userCartSnap = await getDoc(userCartRef);
        if (userCartSnap.exists()) {
          setCartItems(userCartSnap.data().cart || []);
        }

        // Fetch user role from Firestore
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setUserRole(userDocSnap.data().role); // Set the role (admin or user)
        }
      };
      fetchCart();
    }
  }, [user]);

  // Add product to user's cart
  const addToCart = async (product, e) => {
    e.stopPropagation();
    if (!user) {
      showAlert();
      return;
    }

    // To check if product is already in the cart.
    const isProductInCart = cartItems.some((item) => item.id === product.id);
    if (isProductInCart) {
      Swal.fire({
        title: "Already in Cart!",
        text: `${product.name} is already in your cart.`,
        icon: "info",
      });
      return;
    }

    // Check if user is admin from Firestore
    if (userRole === "admin") {
      Swal.fire({
        title: "Action Not Allowed",
        text: "Admin cannot add products to the cart.",
        icon: "error",
      });
      return;
    }

    try {
      const userCartRef = doc(db, "users", user.uid);
      const updatedCart = [
        ...cartItems,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image || "",
          count: 1,
        },
      ];

      await updateDoc(userCartRef, { cart: updatedCart });
      setCartItems(updatedCart);
      showSuccessMessage(product);
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add product to cart. Please try again.");
    }
  };

  // Function to show product details as a popup
  const showProductDetails = (product) => {
    Swal.fire({
      title: `<strong>Product</strong>`,
      html: `
      <p><strong>Name:</strong> ${product.name}</p>
      <p><strong>Category:</strong> ${product.category}</p>
      <p><strong>Details:</strong> ${product.details}</p>
      <p><strong>Description:</strong> ${product.description}</p>
      <p><strong>Price:</strong> ${product.price} Rs</p>
    `,
      confirmButtonText: "Close",
      width: "600px", // Adjust width as needed
      padding: "20px",
      background: "#f9f9f9", // Light background color
      color: "#333", // Text color
      customClass: {
        popup: "custom-popup", // You can define more styles in CSS
      },
    });
  };

  const editProduct = (product, e) => {
    e.stopPropagation();
    if (userRole !== "admin") {
      Swal.fire({
        title: "Action Not Allowed",
        text: "Only admin can edit the product.",
        icon: "error",
      });
      return;
    }

    setIsEditing(true);
    setEditingProduct(product);
  };

  const deleteProduct = async (product, e) => {
    e.stopPropagation();

    if (userRole !== "admin") {
      Swal.fire({
        title: "Action Not Allowed",
        text: "Only admin can edit the product.",
        icon: "error",
      });
      return;
    }

    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to remove this product?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const productRef = doc(db, "products", product.id);
          await deleteDoc(productRef);
          Swal.fire(
            "Deleted!",
            "The product has been removed.",
            "success"
          ).then(() => fetchProducts());
        } catch (error) {
          console.error("Error while deleting the product:", error);
          Swal.fire(
            "Error!",
            "Failed to delete the product. Please try again.",
            "error"
          );
        }
      }
    });
  };

  return loading ? (
    <div className="loading-screen">
      <Loader />
      <p>Loading products...</p>
    </div>
  ) : (
    <div className="cards-container">
      {isEditing && (
        <EditPopup product={editingProduct} setIsEditing={setIsEditing} />
      )}
      {products.length > 0 ? (
        <div className="product-list">
          {products.map((product) => {
            const isInCart = cartItems.some((item) => item.id === product.id);
            return (
              <div
                key={product.id}
                className="product-item"
                onClick={() => showProductDetails(product)}
              >
                <h3>{product.name}</h3>
                <p>Price: {product.price} Rs</p>
                {product.image && (
                  <img
                    src={product.image}
                    alt={product.name}
                    style={{
                      width: "200px",
                      height: "200px",
                      objectFit: "cover",
                    }}
                  />
                )}
                {isInCart && <div className="added-to-cart">✅</div>}
                {userRole !== "admin" ? (
                  <button
                    className="addtocart"
                    onClick={(e) => addToCart(product, e)}
                  >
                    Add to Cart
                  </button>
                ) : (
                  <div>
                    <button
                      className="editProduct"
                      onClick={(e) => editProduct(product, e)}
                    >
                      Edit
                    </button>
                    <button
                      className="deleteProduct"
                      onClick={(e) => deleteProduct(product, e)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p>No products availabe</p>
      )}
    </div>
  );
};

export default ProductsCards;
