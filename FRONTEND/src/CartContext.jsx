import React, { createContext, useContext, useState } from "react";

// Create Context
const CartContext = createContext();

// Provider
export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [totalCost, setTotalCost] = useState(0);

  const addToCart = (item) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.pid === item.pid);
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.pid === item.pid
            ? { ...cartItem, qty: cartItem.qty + item.qty }
            : cartItem
        );
      } else {
        return [...prevCart, item];
      }
    });

    setTotalCost((prevCost) => prevCost + item.pcost * item.qty);
  };

  return (
    <CartContext.Provider value={{ cart, totalCost, addToCart }}>
      {children}
    </CartContext.Provider>
  );
};

// Custom Hook
export const useCart = () => {
  return useContext(CartContext);
};
