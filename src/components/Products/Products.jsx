import React from "react";
import "./Products.css";
import ProductsCards from "../ProductsCards/ProductsCards";

const Products = ({ user }) => {
  return (
    <div className="products-page">
      <ProductsCards user={user} />
    </div>
  );
};

export default Products;
