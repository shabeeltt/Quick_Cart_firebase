import React, { useState } from "react";
import "./EditPopup.css";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";

const EditPopup = ({ setIsEditing, product, setProducts }) => {
  const [editedName, setEditedName] = useState(product.name);
  const [editedPrice, setEditedPrice] = useState(product.price);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const closePopup = () => {
    document.body.style.overflow = "auto";
    document.documentElement.style.overflow = "auto";

    setIsEditing(false);
  };

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
    }
  };

  document.body.style.overflow = "hidden";
  document.documentElement.style.overflow = "hidden";

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Simulate an API call for the edit submission
    setTimeout(async () => {
      if (editedName && editedPrice) {
        try {
          const productRef = doc(db, "products", product.id);
          await updateDoc(productRef, {
            name: editedName,
            price: editedPrice,
          });
        } catch (error) {
          console.log("Error", error);
        }

        closePopup(); // Close the popup after successful submit
        fetchProducts();
      } else {
        setError("Both fields are required");
      }
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="edit-popup-overlay" onClick={closePopup}>
      <div className="edit-popup" onClick={(e) => e.stopPropagation()}>
        <h2>Edit Product</h2>
        <form className="form-group" onSubmit={handleFormSubmit}>
          <label htmlFor="name">Product Name</label>
          <input
            type="text"
            id="name"
            required
            placeholder="Enter product name"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
          />

          <label htmlFor="price">Price</label>
          <input
            type="number"
            id="price"
            required
            placeholder="Enter price"
            value={editedPrice}
            onChange={(e) => setEditedPrice(e.target.value)}
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

          {error && <span className="error">{error}</span>}
        </form>

        <button className="close-btn" onClick={closePopup}>
          Close
        </button>
      </div>
    </div>
  );
};

export default EditPopup;
