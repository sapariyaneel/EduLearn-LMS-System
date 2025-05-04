import React from "react";
import { useCart } from "./CartContext";
import { useNavigate } from "react-router-dom";
import "./CartInvoice.css";
import axios from "axios";

const CartInvoice = () => {
  const { cart, totalCost } = useCart();
  const navigate = useNavigate();

  const handlePayment = async () => {
    try {
      // Add auth token to the request if available
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const orderResponse = await axios.post("http://localhost:9090/create-order", {
        amount: totalCost, // Amount in INR
        currency: "INR",
        receipt: "receipt#1",
      }, { headers });

      const { id: order_id, amount, currency } = orderResponse.data;

      const options = {
        key: "rzp_live_0CAWJFt3q8oaUX",
        amount,
        currency,
        name: "Your Company",
        description: "Test Transaction",
        order_id,
        handler: async (response) => {
          try {
            const verifyResponse = await axios.post(
              "http://localhost:9090/verify-payment",
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              { headers }
            );

            if (verifyResponse.status === 200) {
              alert("Payment Successful!");
            } else {
              alert("Payment Verification Failed!");
            }
          } catch (verifyError) {
            console.error("Payment verification failed:", verifyError);
            alert("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: "Test User",
          email: "test@example.com",
          contact: "9999999999",
        },
        theme: {
          color: "#3399cc",
        },
      };

      const razor = new window.Razorpay(options);
      razor.open();
    } catch (error) {
      console.error("Payment Failed:", error);
      // Show a user-friendly error message
      if (error.response && error.response.status === 401) {
        alert("Please log in to complete your payment.");
      } else {
        alert("Payment processing failed. Please try again later.");
      }
    }
  };
    




  if (cart.length === 0) {
    return (
      <div className="cart-invoice-empty">
        <h2>Your Cart is Empty</h2>
        <button onClick={() => navigate("/userdashboard")} className="back-btn">
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="cart-invoice-container">
      <h1>Invoice</h1>
      <table className="cart-invoice-table">
        <thead>
          <tr>
            <th>Item Name</th>
            <th>Quantity</th>
            <th>Unit Price</th>
            <th>Total Price</th>
          </tr>
        </thead>
        <tbody>
          {cart.map((item) => (
            <tr key={item.pid}>
              <td>{item.pname}</td>
              <td>{item.qty}</td>
              <td>₹{item.pcost.toFixed(2)}</td>
              <td>₹{(item.qty * item.pcost).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan="3" className="cart-total-label">Total Amount:</td>
            <td className="cart-total-value">₹{totalCost.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>
      <button onClick={handlePayment} className="back-btn">
        Payment
      </button>
    </div>
  );
};

export default CartInvoice;
