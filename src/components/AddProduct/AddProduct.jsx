import { useEffect, useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import "./AddProduct.css";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { auth } from "../../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const AddProduct = () => {
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  const showAlert = () => {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "You must be an admin to add a product!",
    }).then(() => navigate("/", { replace: true }));
  };

  const showMessage = () => {
    Swal.fire(
      "Product Added!",
      "Your Product has been added successfully.",
      "success"
    );
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        showAlert();
        navigate("/auth");
        return;
      }

      const userRef = doc(db, "users", currentUser.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists() && userDoc.data().role === "admin") {
        setIsAdmin(true); // User is admin
      } else {
        setIsAdmin(false); // User is not admin
        showAlert();
      }
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, [navigate]);

  // Function to add the product details to Firestore
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!isAdmin) return; // Prevent submitting if not admin

    try {
      // Add product details to Firestore collection
      setIsSubmitting(true);
      const productRef = await addDoc(collection(db, "products"), {
        name: productName,
        price: productPrice,
      });

      // Clear form fields after submission
      setProductName("");
      setProductPrice("");
      setIsSubmitting(false);
      showMessage();
    } catch (error) {
      console.error("Error adding product:", error);
      setError("There was an error adding the product.");
    }
  };

  return (
    <>
      <h1>ADD PRODUCT</h1>
      <form className="form-group" onSubmit={handleFormSubmit}>
        <label htmlFor="name">Product Name</label>
        <input
          type="text"
          id="name"
          autoComplete="false"
          required
          placeholder="Enter product name"
          onChange={(e) => setProductName(e.target.value)}
          value={productName}
        />
        <label htmlFor="price">Price</label>
        <input
          type="number"
          id="price"
          autoComplete="false"
          required
          placeholder="Enter price"
          onChange={(e) => setProductPrice(e.target.value)}
          value={productPrice}
        />
        <button type="submit">
          {isSubmitting ? (
            <svg
              width="20"
              height="20"
              viewBox="0 0 50 50"
              xmlns="http://www.w3.org/2000/svg"
              className="loading-spinner"
            >
              <circle
                cx="25"
                cy="25"
                r="20"
                stroke="white"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
                strokeDasharray="125, 200"
                strokeDashoffset="0"
              >
                <animateTransform
                  attributeType="XML"
                  attributeName="transform"
                  type="rotate"
                  from="0 25 25"
                  to="360 25 25"
                  dur="1s"
                  repeatCount="indefinite"
                  easing="ease-in-out"
                />
                <animate
                  attributeName="stroke-dashoffset"
                  values="0; -200"
                  dur="1s"
                  repeatCount="indefinite"
                />
              </circle>
            </svg>
          ) : (
            "Submit"
          )}
        </button>
        {error && <span>{error}</span>}
      </form>
    </>
  );
};

export default AddProduct;
