"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [copiedBank, setCopiedBank] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [showSizeSelector, setShowSizeSelector] = useState(false);

  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    customerAddress: "",
    paymentMethod: "transfer",
    notes: "",
  });

  // Fetch products dan stok
  useEffect(() => {
    fetch(`${API_URL}/products`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);

        // Load items from localStorage
        const savedCart = localStorage.getItem("cavo_cart");
        if (savedCart) {
          const items = JSON.parse(savedCart);
          // Add current product from URL if it's not in cart yet (legacy support)
          const urlProduct = searchParams.get("product");
          const urlSize = searchParams.get("size");

          if (
            urlProduct &&
            urlSize &&
            !items.find((i: any) => i.name === urlProduct && i.size === urlSize)
          ) {
            const productItem = data.find((p: any) => p.name === urlProduct);
            if (productItem) {
              items.push({
                id: productItem.id,
                name: productItem.name,
                size: urlSize,
                price: productItem.price,
                image: productItem.image_url,
                gelar: productItem.gelar || "Black Edition",
                quantity: 1,
              });
            }
          }
          setCartItems(items);
        }
      });
  }, [searchParams]);

  const copyToClipboard = async (text: string, bank: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedBank(bank);
    setTimeout(() => setCopiedBank(null), 2000);
  };

  const updateQuantity = (index: number, delta: number) => {
    const newCart = [...cartItems];
    const item = newCart[index];
    const product = products.find((p) => p.id === item.id);
    const stockLimit = product
      ? product[`stock_${item.size.toLowerCase()}`]
      : 99;

    const newQty = item.quantity + delta;
    if (newQty >= 1 && newQty <= stockLimit) {
      item.quantity = newQty;
      setCartItems(newCart);
      localStorage.setItem("cavo_cart", JSON.stringify(newCart));
    }
  };

  const removeItem = (index: number) => {
    const newCart = cartItems.filter((_, i) => i !== index);
    setCartItems(newCart);
    localStorage.setItem("cavo_cart", JSON.stringify(newCart));
    if (newCart.length === 0) router.push("/");
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    const nameRegex = /^[a-zA-Z\s]{3,}$/;
    if (!formData.customerName.trim()) {
      newErrors.customerName = "Nama lengkap wajib diisi";
    } else if (!nameRegex.test(formData.customerName.trim())) {
      newErrors.customerName = "Nama minimal 3 karakter dan hanya huruf";
    }

    let cleanPhone = formData.customerPhone.replace(/\s/g, "");
    if (!cleanPhone) {
      newErrors.customerPhone = "Nomor WhatsApp wajib diisi";
    } else {
      if (cleanPhone.startsWith("+")) {
        cleanPhone = cleanPhone.substring(1);
      }
      if (cleanPhone.startsWith("62") && cleanPhone.length < 9) {
        newErrors.customerPhone = "Nomor WhatsApp tidak valid";
      } else if (!cleanPhone.startsWith("62") && cleanPhone.length < 10) {
        newErrors.customerPhone = "Nomor WhatsApp minimal 10 digit";
      } else if (cleanPhone.length > 13) {
        newErrors.customerPhone = "Nomor WhatsApp maksimal 13 digit";
      } else if (!/^\d+$/.test(cleanPhone)) {
        newErrors.customerPhone = "Nomor WhatsApp hanya boleh angka";
      }
    }

    if (!formData.customerAddress.trim()) {
      newErrors.customerAddress = "Alamat lengkap wajib diisi";
    } else if (formData.customerAddress.trim().length < 10) {
      newErrors.customerAddress = "Alamat minimal 10 karakter";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cartItems.length === 0) return;
    if (!validateForm()) return;

    setLoading(true);

    try {
      const paymentMethodText = "Transfer Bank (BCA/Mandiri)";
      const totalOverall = cartItems.reduce(
        (sum, item) => sum + parseInt(item.price) * item.quantity,
        0,
      );

      // ✅ KIRIM 1 REQUEST DENGAN ARRAY ITEMS (BUKAN LOOP)
      const itemsPayload = cartItems.map((item) => ({
        product_name: item.name,
        product_gelar: item.gelar,
        size: item.size,
        quantity: item.quantity,
        price: parseInt(item.price),
      }));

      const response = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: formData.customerName.trim(),
          customer_phone: formData.customerPhone.replace(/\s/g, ""),
          customer_address: formData.customerAddress.trim(),
          items: itemsPayload,
          total_price: totalOverall,
          payment_method: paymentMethodText,
          notes: formData.notes.trim(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Gagal memproses order");
      }

      // Simpan data untuk WA konfirmasi
      const orderSummary = {
        customer_name: formData.customerName.trim(),
        items: cartItems,
        total: totalOverall,
      };
      localStorage.setItem("last_order", JSON.stringify(orderSummary));
      localStorage.removeItem("cavo_cart");
      setSuccess(true);
    } catch (err: any) {
      alert(err.message || "Gagal memproses order");
    }

    setLoading(false);
  };

  if (success) {
    const lastOrder = JSON.parse(localStorage.getItem("last_order") || "{}");
    const itemsList =
      lastOrder.items
        ?.map((i: any) => `- ${i.name} (${i.size}) x${i.quantity}`)
        .join("\n") || "";

    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-5">
        <div className="text-center">
          <div className="text-5xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-black mb-2">
            Order Berhasil!
          </h1>
          <p className="text-gray-600 mb-4">
            Terima kasih sudah berbelanja di CAVO.
          </p>

          <button
            onClick={() => {
              const message = `KONFIRMASI PEMBAYARAN CAVO

Data Customer:
Nama: ${formData.customerName}
No WA: ${formData.customerPhone}

Pesanan:
${itemsList}
Total: Rp ${lastOrder.total?.toLocaleString("id-ID")}

Bukti transfer terlampir.
Mohon konfirmasi. Terima kasih.`;

              window.open(
                `https://wa.me/6282197629818?text=${encodeURIComponent(message)}`,
                "_blank",
              );
            }}
            className="bg-green-600 text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-green-700 mb-3"
          >
            Kirim Bukti Transfer
          </button>

          <p className="text-gray-400 text-xs mb-4">
            Klik tombol di atas setelah transfer
          </p>

          <a
            href="/"
            className="inline-block bg-black text-white px-6 py-2 rounded-full text-sm hover:bg-gray-800"
          >
            Kembali ke Beranda
          </a>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0 && !loading) {
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

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + parseInt(item.price) * item.quantity,
    0,
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto px-5">
        {/* Header Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.back()}
            className="text-gray-500 hover:text-black flex items-center gap-1 text-sm transition"
          >
            <span className="text-lg">←</span> Kembali
          </button>
          <h1 className="text-xl font-bold text-black pr-14 flex-1 text-center">
            Checkout
          </h1>
        </div>

        <div className="w-full h-px bg-gray-200 mb-6" />

        {/* Daftar Keranjang */}
        <div className="space-y-4 mb-6">
          {cartItems.map((item, index) => (
            <div
              key={`${item.id}-${item.size}`}
              className="bg-white rounded-lg p-4 shadow-sm relative"
            >
              <button
                onClick={() => removeItem(index)}
                className="absolute top-2 right-2 text-gray-300 hover:text-red-500 text-xs"
              >
                ✕
              </button>
              <div className="flex gap-3">
                <div className="relative w-16 h-20 bg-gray-100 rounded overflow-hidden">
                  <Image
                    src={item.image || "/models/logo.png"}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-black text-sm">{item.name}</h3>
                  <p className="text-[10px] text-gray-500">{item.gelar}</p>
                  <p className="text-xs text-black mt-1">
                    Size: <span className="font-bold">{item.size}</span>
                  </p>

                  <div className="flex justify-between items-end mt-2">
                    <div className="flex items-center gap-3 border border-gray-200 rounded-full px-2 py-1">
                      <button
                        type="button"
                        onClick={() => updateQuantity(index, -1)}
                        className="text-gray-500 w-4"
                      >
                        -
                      </button>
                      <span className="text-xs font-bold text-black w-4 text-center">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(index, 1)}
                        className="text-gray-500 w-4"
                      >
                        +
                      </button>
                    </div>
                    <p className="text-sm font-bold text-black">
                      Rp{" "}
                      {(parseInt(item.price) * item.quantity).toLocaleString(
                        "id-ID",
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={() => router.push("/")}
            className="w-full py-2 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 text-xs hover:border-black hover:text-black transition"
          >
            + Tambah Produk Lain
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <input
              type="text"
              placeholder="Nama Lengkap"
              value={formData.customerName}
              onChange={(e) =>
                setFormData({ ...formData, customerName: e.target.value })
              }
              className={`w-full px-4 py-2 border rounded text-black placeholder-gray-400 focus:outline-none focus:border-black ${
                errors.customerName ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.customerName && (
              <p className="text-red-500 text-xs mt-1">{errors.customerName}</p>
            )}
          </div>

          <div>
            <input
              type="tel"
              placeholder="No. WhatsApp (contoh: 81234567890)"
              value={formData.customerPhone}
              onChange={(e) =>
                setFormData({ ...formData, customerPhone: e.target.value })
              }
              className={`w-full px-4 py-2 border rounded text-black placeholder-gray-400 focus:outline-none focus:border-black ${
                errors.customerPhone ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.customerPhone && (
              <p className="text-red-500 text-xs mt-1">
                {errors.customerPhone}
              </p>
            )}
          </div>

          <div>
            <textarea
              placeholder="Alamat Lengkap (Jalan, RT/RW, Kelurahan, Kecamatan, Kabupaten/Kota)"
              rows={3}
              value={formData.customerAddress}
              onChange={(e) =>
                setFormData({ ...formData, customerAddress: e.target.value })
              }
              className={`w-full px-4 py-2 border rounded text-black placeholder-gray-400 focus:outline-none focus:border-black ${
                errors.customerAddress ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.customerAddress && (
              <p className="text-red-500 text-xs mt-1">
                {errors.customerAddress}
              </p>
            )}
          </div>

          {/* Metode Pembayaran */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-black">
              Metode Pembayaran
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="transfer"
                  checked={formData.paymentMethod === "transfer"}
                  onChange={(e) =>
                    setFormData({ ...formData, paymentMethod: e.target.value })
                  }
                  className="text-black"
                />
                <span className="text-sm text-black">
                  Transfer Bank (BCA / Mandiri)
                </span>
              </label>

              {formData.paymentMethod === "transfer" && (
                <div className="ml-6 space-y-3">
                  <div className="p-3 bg-white border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 relative">
                        <Image
                          src="https://www.svgrepo.com/show/303676/bca-bank-central-asia-logo.svg"
                          alt="BCA"
                          width={32}
                          height={32}
                          className="object-contain"
                        />
                      </div>
                      <span className="font-semibold text-black text-sm">
                        Bank BCA
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs text-gray-500">Nomor Rekening</p>
                        <p className="text-sm font-mono text-black">
                          4720483365
                        </p>
                        <p className="text-xs text-gray-500">
                          a.n Rivaldo Siregar
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard("4720483365", "BCA")}
                        className="text-xs bg-gray-100 text-black px-3 py-1 rounded hover:bg-gray-200 transition"
                      >
                        {copiedBank === "BCA" ? "Tersalin!" : "Salin"}
                      </button>
                    </div>
                  </div>

                  <div className="p-3 bg-white border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 relative">
                        <Image
                          src="https://upload.wikimedia.org/wikipedia/en/f/fa/Bank_Mandiri_logo.svg"
                          alt="Mandiri"
                          width={32}
                          height={32}
                          className="object-contain"
                        />
                      </div>
                      <span className="font-semibold text-black text-sm">
                        Bank Mandiri
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs text-gray-500">Nomor Rekening</p>
                        <p className="text-sm font-mono text-black">
                          1540016892808
                        </p>
                        <p className="text-xs text-gray-500">
                          a.n Rivaldo Siregar
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          copyToClipboard("1540016892808", "Mandiri")
                        }
                        className="text-xs bg-gray-100 text-black px-3 py-1 rounded hover:bg-gray-200 transition"
                      >
                        {copiedBank === "Mandiri" ? "Tersalin!" : "Salin"}
                      </button>
                    </div>
                  </div>

                  <p className="text-[10px] text-gray-400 text-center">
                    Setelah transfer, konfirmasi di halaman sukses
                  </p>
                </div>
              )}
            </div>
          </div>

          <textarea
            placeholder="Catatan (opsional) - Contoh: Pakai kurir JNE, Pintu belakang, dll"
            rows={2}
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded text-black placeholder-gray-400 focus:outline-none focus:border-black"
          />

          <div className="border-t border-gray-200 pt-3 mt-3">
            <div className="flex justify-between font-bold text-lg">
              <span className="text-black">Total</span>
              <span className="text-black">
                Rp {totalPrice.toLocaleString("id-ID")}
              </span>
            </div>
            <p className="text-[10px] text-gray-400 mt-1">
              *Harga sudah termasuk pajak
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || cartItems.length === 0}
            className="w-full mt-4 py-3 bg-black text-white text-sm font-medium rounded-full hover:bg-gray-800 transition disabled:bg-gray-400"
          >
            {loading ? "Memproses..." : "Buat Pesanan"}
          </button>
        </form>

        {/* Tombol Kembali ke Toko */}
        <button
          type="button"
          onClick={() => router.back()}
          className="w-full mt-3 py-2 bg-gray-100 text-black text-sm rounded-full hover:bg-gray-200 transition"
        >
          ← Kembali ke Toko
        </button>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-black font-medium">Loading Checkout...</div>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
