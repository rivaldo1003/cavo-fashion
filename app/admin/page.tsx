"use client";

import { useState, useEffect } from "react";
import { LoadingScreen } from "./LoadingScreen";
import ProductTab from "./ProductTab";
import OrderTab from "./OrderTab";
import { useAdmin } from "./useAdmin";

export default function AdminPage() {
  const {
    isAuthenticated,
    products,
    orders,
    loading,
    loadingOrders,
    message,
    activeTab,
    setActiveTab,
    login,
    logout,
    fetchOrders,
    updateStock,
    updateProductDetails,
    updateOrderStatus,
  } = useAdmin();

  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(password);
    if (!success) alert("Password salah!");
  };

  if (loading) return <LoadingScreen />;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-80">
          <div className="text-center mb-6">
            <div className="text-2xl font-bold text-black">CAVO</div>
            <div className="text-xs text-gray-400 mt-1">Admin Login</div>
          </div>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded mb-3 text-black focus:outline-none focus:border-black"
              autoFocus
            />
            <button
              type="submit"
              className="w-full bg-black text-white py-2 rounded hover:bg-gray-800"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-black">Admin</h1>
              <p className="text-xs text-gray-400">CAVO Management</p>
            </div>
            <button
              onClick={logout}
              className="text-xs text-gray-400 hover:text-black"
            >
              Logout
            </button>
          </div>
          <div className="flex gap-6 mt-3">
            <button
              onClick={() => setActiveTab("products")}
              className={`pb-2 text-sm ${
                activeTab === "products"
                  ? "text-black border-b border-black"
                  : "text-gray-400"
              }`}
            >
              Products
            </button>
            <button
              onClick={() => {
                setActiveTab("orders");
                fetchOrders();
              }}
              className={`pb-2 text-sm ${
                activeTab === "orders"
                  ? "text-black border-b border-black"
                  : "text-gray-400"
              }`}
            >
              Orders {orders.length > 0 && `(${orders.length})`}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6">
        {message && (
          <div className="mb-4 p-2 bg-gray-100 text-black text-sm text-center rounded">
            {message}
          </div>
        )}

        {activeTab === "products" && (
          <ProductTab
            products={products}
            updateStock={updateStock}
            updateProductDetails={updateProductDetails}
            uploadImage={async () => {}}
          />
        )}

        {activeTab === "orders" && (
          <OrderTab
            orders={orders}
            loading={loadingOrders}
            updateStatus={updateOrderStatus}
          />
        )}
      </div>
    </div>
  );
}
