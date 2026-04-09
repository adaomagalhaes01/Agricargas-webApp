import React from "react"
import AppNavigator from "./src/navigation/AppNavigator"
import { AuthProvider } from "./src/context/AuthContext"
import { CartProvider } from "./src/context/CartContext"
import "./src/i18n";

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppNavigator />
      </CartProvider>
    </AuthProvider>
  )
}


