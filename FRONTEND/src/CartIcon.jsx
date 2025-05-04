import React from "react";
import { useCart } from "./CartContext";
import { useNavigate } from "react-router-dom";
import "./CartIcon.css";

const CartIcon = () => {
  const { totalCost, cart } = useCart();
  const navigate = useNavigate();

  return (
    <div className="cart-icon btn btn-primary position-relative" onClick={() => navigate("/cart")}>
      <i className="bi bi-cart"></i>
      <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
        {cart.length}
      </span>
      <span className="ms-2">Total: ₹{totalCost.toFixed(2)}</span>
    </div>
  );
};

export default CartIcon;
