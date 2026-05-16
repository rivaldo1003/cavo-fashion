"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("products");
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [uploadingImage, setUploadingImage] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    gelar: "",
    theme: "",
    price: 0,
  });
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

  // Cek session saat pertama kali halaman dimuat (untuk cegah relogin saat refresh)
  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem("cavo_admin_token");
      if (token) {
        try {
          // Verifikasi token ke API menggunakan method GET
          const res = await fetch("/admin/login", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          if (data.authenticated) {
            setIsAuthenticated(true);
            fetchProducts();
            fetchOrders();
            return; // Biarkan fetchProducts yang mematikan state loading nanti
          } else {
            localStorage.removeItem("cavo_admin_token");
          }
        } catch (err) {
          console.error("Gagal verifikasi session:", err);
        }
      }
      setLoading(false); // Matikan loading jika tidak ada token atau verifikasi gagal
    };
    checkSession();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
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
        fetchOrders();
      } else {
        alert(data.error || "Password salah!");
      }
    } catch (err) {
      alert("Gagal menghubungi server login.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("cavo_admin_token");
    setIsAuthenticated(false);
    setPassword(""); // Reset field password
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/products`);
      if (!res.ok) throw new Error("Server Error");
      const data = await res.json();
      setProducts(data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setMessage("Gagal memuat produk dari server.");
    }
  };

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await fetch(`${API_URL}/orders`);
      if (!res.ok) throw new Error("Server Error");
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error("Gagal fetch orders:", err);
      setMessage("Gagal memuat order.");
    }
    setLoadingOrders(false);
  };
  const updateOrderStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`${API_URL}/orders/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setMessage(`Status order diubah menjadi ${status}`);
        setTimeout(() => setMessage(""), 2000);
        fetchOrders(); // Refresh order list
        fetchProducts(); // ✅ TAMBAHKAN: Refresh stok produk juga
      }
    } catch (err) {
      setMessage("Gagal update status");
      setTimeout(() => setMessage(""), 2000);
    }
  };

  const updateStock = async (
    id: number,
    stock_s: number,
    stock_m: number,
    stock_l: number,
    stock_xl: number,
  ) => {
    try {
      const res = await fetch(`${API_URL}/products/${id}/stock`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock_s, stock_m, stock_l, stock_xl }),
      });
      if (res.ok) {
        setMessage("Stok berhasil diupdate");
        setTimeout(() => setMessage(""), 2000);
        fetchProducts();
      }
    } catch (err) {
      setMessage("Gagal update stok");
      setTimeout(() => setMessage(""), 2000);
    }
  };

  const updateProductDetails = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}/products/${id}/details`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        setMessage("Detail produk berhasil diupdate");
        setTimeout(() => setMessage(""), 2000);
        fetchProducts();
        setEditingProduct(null);
      }
    } catch (err) {
      setMessage("Gagal update detail");
      setTimeout(() => setMessage(""), 2000);
    }
  };

  const uploadImage = async (id: number, file: File) => {
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch(`${API_URL}/products/${id}/upload`, {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        setMessage("Foto berhasil diupload");
        setTimeout(() => setMessage(""), 2000);
        fetchProducts();
        setUploadingImage(null);
      }
    } catch (err) {
      setMessage("Gagal upload foto");
      setTimeout(() => setMessage(""), 2000);
    }
  };

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "paid":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Menunggu Pembayaran";
      case "paid":
        return "Sudah Dibayar";
      case "shipped":
        return "Dikirim";
      case "delivered":
        return "Selesai";
      case "cancelled":
        return "Dibatalkan";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          {/* Logo dengan animasi */}
          {/* <motion.div
             animate={{
               scale: [1, 1.05, 1],
               opacity: [0.7, 1, 0.7],
             }}
             transition={{
               duration: 1.5,
               repeat: Infinity,
               ease: "easeInOut",
             }}
             className="relative w-24 h-24 mx-auto mb-4"
           >
             <Image
               src="/models/logo.png"
               alt="CAVO"
               fill
               className="object-contain"
               priority
             />
           </motion.div> */}

          {/* Teks brand dengan fade in/out */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl font-light tracking-[0.3em] text-gray-400 uppercase"
          >
            CAVO
          </motion.h1>

          <motion.div
            initial={{ width: 0 }}
            animate={{ width: 40 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="h-px bg-gray-300 mx-auto my-3"
          />

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-[9px] tracking-[0.2em] text-gray-300 uppercase"
          >
            Minimum Form. Maximum Presence.
          </motion.p>

          {/* Loading dots */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex justify-center gap-1 mt-4"
          >
            {[0, 0.2, 0.4].map((delay, i) => (
              <motion.span
                key={i}
                animate={{
                  y: [0, -6, 0],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: delay,
                }}
                className="w-1.5 h-1.5 bg-gray-400 rounded-full"
              />
            ))}
          </motion.div>
        </motion.div>
      </div>
    );
  }

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

  const faithArchives = products.filter((p) => p.category === "FAITH ARCHIVES");
  const essentials = products.find((p) => p.category === "ESSENTIALS");

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
              onClick={handleLogout}
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
          <>
            {/* Modal Edit Product */}
            {editingProduct && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded max-w-md w-full p-6">
                  <h2 className="text-lg font-bold text-black mb-4">
                    Edit {editingProduct.name}
                  </h2>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Nama"
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, name: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded text-black"
                    />
                    <input
                      type="text"
                      placeholder="Gelar (contoh: GIANT SLATER)"
                      value={editForm.gelar}
                      onChange={(e) =>
                        setEditForm({ ...editForm, gelar: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded text-black"
                    />
                    <input
                      type="text"
                      placeholder="Theme (contoh: Faith Over Fear)"
                      value={editForm.theme}
                      onChange={(e) =>
                        setEditForm({ ...editForm, theme: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded text-black"
                    />
                    <input
                      type="number"
                      placeholder="Harga"
                      value={editForm.price}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          price: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded text-black"
                    />
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => updateProductDetails(editingProduct.id)}
                        className="flex-1 bg-black text-white py-2 rounded hover:bg-gray-800"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingProduct(null)}
                        className="flex-1 bg-gray-100 text-black py-2 rounded hover:bg-gray-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Upload Image */}
            {uploadingImage && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded max-w-md w-full p-6">
                  <h2 className="text-lg font-bold text-black mb-4">
                    Upload Foto
                  </h2>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        uploadImage(uploadingImage.id, e.target.files[0]);
                      }
                    }}
                    className="w-full text-black text-sm"
                  />
                  <button
                    onClick={() => setUploadingImage(null)}
                    className="w-full mt-4 bg-gray-100 text-black py-2 rounded hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* FAITH ARCHIVES */}
            <div className="mb-8">
              <h2 className="text-base font-bold text-black mb-3">
                Faith Archives
              </h2>
              <div className="space-y-3">
                {faithArchives.map((product) => (
                  <div
                    key={product.id}
                    className="border border-gray-100 rounded p-4"
                  >
                    <div className="flex gap-4">
                      <div className="relative w-14 h-14 bg-gray-50 rounded overflow-hidden flex-shrink-0">
                        <Image
                          src={product.image_url || "/models/placeholder.png"}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-black">
                              {product.name}
                            </h3>
                            <p className="text-xs text-gray-500">
                              {product.gelar}
                            </p>
                            <p className="text-xs text-gray-400">
                              {product.theme}
                            </p>
                            <p className="text-sm font-medium text-black mt-1">
                              Rp {product.price.toLocaleString("id-ID")}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-gray-500 mb-2">
                              Total: {product.total_stok} pcs
                            </div>
                            <button
                              onClick={() => {
                                setEditingProduct(product);
                                setEditForm({
                                  name: product.name,
                                  gelar: product.gelar || "",
                                  theme: product.theme || "",
                                  price: product.price,
                                });
                              }}
                              className="text-xs bg-gray-100 text-black px-3 py-1 rounded mr-2 hover:bg-gray-200"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() =>
                                setUploadingImage({
                                  id: product.id,
                                  name: product.name,
                                })
                              }
                              className="text-xs bg-gray-100 text-black px-3 py-1 rounded hover:bg-gray-200"
                            >
                              Upload Foto
                            </button>
                          </div>
                        </div>

                        {/* Stock Inputs */}
                        <div className="grid grid-cols-4 gap-3 mt-3 pt-3 border-t border-gray-50">
                          {["S", "M", "L", "XL"].map((size) => {
                            const stockKey = `stock_${size.toLowerCase()}`;
                            const currentStock = product[stockKey] || 0;
                            return (
                              <div key={size}>
                                <label className="text-xs text-gray-500 block mb-1">
                                  {size}
                                </label>
                                <input
                                  type="number"
                                  value={currentStock}
                                  onChange={(e) => {
                                    const newStock =
                                      parseInt(e.target.value) || 0;
                                    updateStock(
                                      product.id,
                                      size === "S" ? newStock : product.stock_s,
                                      size === "M" ? newStock : product.stock_m,
                                      size === "L" ? newStock : product.stock_l,
                                      size === "XL"
                                        ? newStock
                                        : product.stock_xl,
                                    );
                                  }}
                                  className="w-full px-2 py-1 border border-gray-200 rounded text-sm text-black"
                                  min="0"
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ESSENTIALS */}
            {essentials && (
              <div>
                <h2 className="text-base font-bold text-black mb-3">
                  Essentials
                </h2>
                <div className="border border-gray-100 rounded p-4">
                  <div className="flex gap-4">
                    <div className="relative w-14 h-14 bg-gray-50 rounded overflow-hidden flex-shrink-0">
                      <Image
                        src={essentials.image_url || "/models/placeholder.png"}
                        alt={essentials.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-black">
                            {essentials.name}
                          </h3>
                          <p className="text-xs text-gray-500">Black Edition</p>
                          <p className="text-sm font-medium text-black mt-1">
                            Rp {essentials.price.toLocaleString("id-ID")}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-500 mb-2">
                            Total: {essentials.total_stok} pcs
                          </div>
                          <button
                            onClick={() => {
                              setEditingProduct(essentials);
                              setEditForm({
                                name: essentials.name,
                                gelar: essentials.gelar || "",
                                theme: essentials.theme || "",
                                price: essentials.price,
                              });
                            }}
                            className="text-xs bg-gray-100 text-black px-3 py-1 rounded mr-2 hover:bg-gray-200"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() =>
                              setUploadingImage({
                                id: essentials.id,
                                name: essentials.name,
                              })
                            }
                            className="text-xs bg-gray-100 text-black px-3 py-1 rounded hover:bg-gray-200"
                          >
                            Upload Foto
                          </button>
                        </div>
                      </div>

                      {/* Stock Inputs */}
                      <div className="grid grid-cols-4 gap-3 mt-3 pt-3 border-t border-gray-50">
                        {["S", "M", "L", "XL"].map((size) => {
                          const stockKey = `stock_${size.toLowerCase()}`;
                          const currentStock = essentials[stockKey] || 0;
                          return (
                            <div key={size}>
                              <label className="text-xs text-gray-500 block mb-1">
                                {size}
                              </label>
                              <input
                                type="number"
                                value={currentStock}
                                onChange={(e) => {
                                  const newStock =
                                    parseInt(e.target.value) || 0;
                                  updateStock(
                                    essentials.id,
                                    size === "S"
                                      ? newStock
                                      : essentials.stock_s,
                                    size === "M"
                                      ? newStock
                                      : essentials.stock_m,
                                    size === "L"
                                      ? newStock
                                      : essentials.stock_l,
                                    size === "XL"
                                      ? newStock
                                      : essentials.stock_xl,
                                  );
                                }}
                                className="w-full px-2 py-1 border border-gray-200 rounded text-sm text-black"
                                min="0"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === "orders" && (
          <div>
            {loadingOrders ? (
              <div className="text-center py-12">
                <p className="text-gray-400">Loading orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400">Belum ada order</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="border border-gray-100 rounded-lg overflow-hidden"
                  >
                    {/* Order Header */}
                    <div
                      className="p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition"
                      onClick={() =>
                        setExpandedOrder(
                          expandedOrder === order.id ? null : order.id,
                        )
                      }
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-xs text-black">
                              {order.order_number}
                            </span>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${getStatusBadge(
                                order.status,
                              )}`}
                            >
                              {getStatusText(order.status)}
                            </span>
                          </div>
                          <div className="text-sm text-black mt-1">
                            {order.customer_name}
                          </div>
                          <div className="text-xs text-gray-400">
                            {new Date(order.created_at).toLocaleString("id-ID")}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-black">
                            Rp {order.total_price.toLocaleString("id-ID")}
                          </div>
                          <div className="text-xs text-gray-400">
                            {order.product_name} - {order.size}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Order Detail (Expand) */}
                    {expandedOrder === order.id && (
                      <div className="p-4 border-t border-gray-100 space-y-3">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-xs text-gray-400">Customer</p>
                            <p className="text-black font-medium">
                              {order.customer_name}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {order.customer_phone}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Alamat</p>
                            <p className="text-black text-sm">
                              {order.customer_address}
                            </p>
                          </div>
                        </div>

                        <div>
                          <p className="text-xs text-gray-400">Produk</p>
                          <p className="text-black text-sm">
                            {order.product_name}{" "}
                            {order.product_gelar && `- ${order.product_gelar}`}
                          </p>
                          <p className="text-xs text-gray-500">
                            Ukuran: {order.size} | Qty: {order.quantity}
                          </p>
                        </div>

                        {order.notes && (
                          <div>
                            <p className="text-xs text-gray-400">Catatan</p>
                            <p className="text-black text-sm">{order.notes}</p>
                          </div>
                        )}

                        <div>
                          <p className="text-xs text-gray-400">Metode Bayar</p>
                          <p className="text-black text-sm">
                            {order.payment_method}
                          </p>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <select
                            value={order.status}
                            onChange={(e) =>
                              updateOrderStatus(order.id, e.target.value)
                            }
                            className="text-xs px-3 py-1 border border-gray-300 rounded text-black"
                          >
                            <option value="pending">Menunggu Pembayaran</option>
                            <option value="paid">Sudah Dibayar</option>
                            <option value="shipped">Dikirim</option>
                            <option value="delivered">Selesai</option>
                            <option value="cancelled">Dibatalkan</option>
                          </select>
                          <button
                            onClick={() => {
                              // Format nomor dari database (082197629818) ke format WhatsApp (6282197629818)
                              let phoneNumber = order.customer_phone;
                              phoneNumber = phoneNumber
                                .replace(/\s/g, "")
                                .replace(/-/g, "");

                              // Jika dimulai dengan 0, ganti dengan 62
                              if (phoneNumber.startsWith("0")) {
                                phoneNumber = "62" + phoneNumber.substring(1);
                              }
                              // Jika dimulai dengan +, hapus +
                              if (phoneNumber.startsWith("+")) {
                                phoneNumber = phoneNumber.substring(1);
                              }

                              const waMessage = `*CAVO - Detail Pesanan*

================================
Nomor Order: ${order.order_number}
Status: ${getStatusText(order.status)}
================================

*Data Customer*
Nama: ${order.customer_name}
WhatsApp: ${order.customer_phone}
Alamat: ${order.customer_address}

*Detail Produk*
Produk: ${order.product_name}${order.product_gelar ? ` - ${order.product_gelar}` : ""}
Ukuran: ${order.size}
Jumlah: ${order.quantity} pcs
Harga: Rp ${order.total_price.toLocaleString("id-ID")}
Metode Bayar: ${order.payment_method}

${order.notes ? `*Catatan:* ${order.notes}` : ""}

================================
Terima kasih sudah berbelanja di CAVO.
Minimal Form. Maximum Presence. \n
================================`;

                              window.open(
                                `https://wa.me/${phoneNumber}?text=${encodeURIComponent(waMessage)}`,
                                "_blank",
                              );
                            }}
                            className="text-xs bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                          >
                            WhatsApp Customer
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
