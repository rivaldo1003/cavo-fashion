"use client";

import { useState, useEffect, useCallback } from "react";
import { Product, Order } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export function useAdmin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("products");

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  };

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/products`);
      if (!res.ok) throw new Error("Server Error");
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      showMessage("Gagal memuat produk.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    setLoadingOrders(true);
    try {
      const res = await fetch(`${API_URL}/orders`);
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      showMessage("Gagal memuat order.");
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem("cavo_admin_token");
      if (token) {
        try {
          const res = await fetch("/admin/login", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          if (data.authenticated) {
            setIsAuthenticated(true);
            await fetchProducts();
            return;
          }
        } catch (e) {
          localStorage.removeItem("cavo_admin_token");
        }
      }
      setLoading(false);
    };
    checkSession();
  }, [fetchProducts]);

  const login = async (password: string) => {
    const res = await fetch("/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    if (data.success) {
      localStorage.setItem("cavo_admin_token", data.token);
      setIsAuthenticated(true);
      fetchProducts();
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem("cavo_admin_token");
    setIsAuthenticated(false);
  };

  const updateStock = async (
    id: number,
    stocks: {
      stock_s: number;
      stock_m: number;
      stock_l: number;
      stock_xl: number;
    },
  ) => {
    try {
      const res = await fetch(`${API_URL}/products/${id}/stock`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(stocks),
      });
      if (res.ok) {
        showMessage("Stok berhasil diperbarui ✅");
        await fetchProducts(); // Refresh data
        return true;
      } else {
        const error = await res.json();
        showMessage(`Gagal: ${error.message || "Server error"}`);
        return false;
      }
    } catch (err) {
      console.error("Error update stock:", err);
      showMessage("Gagal update stok ❌");
      return false;
    }
  };

  const updateProductDetails = async (id: number, form: any) => {
    try {
      const res = await fetch(`${API_URL}/products/${id}/details`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        showMessage("Detail diperbarui");
        fetchProducts();
      }
    } catch (err) {
      showMessage("Gagal update detail");
    }
  };

  const updateOrderStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`${API_URL}/orders/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        showMessage(`Status diubah: ${status}`);
        fetchOrders();
        fetchProducts();
      }
    } catch (err) {
      showMessage("Gagal update status");
    }
  };

  return {
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
  };
}
