"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [copiedBank, setCopiedBank] = useState<string | null>(null);
  const [productData, setProductData] = useState<{
    name: string | null;
    size: string | null;
    price: string | null;
    image: string | null;
    gelar: string | null;
  } | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [maxStock, setMaxStock] = useState(0);
  const [availableSizes, setAvailableSizes] = useState<any>({});
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

        const product = searchParams.get("product");
        const size = searchParams.get("size");
        const price = searchParams.get("price");
        const image = searchParams.get("image");
        const gelar = searchParams.get("gelar");

        setProductData({
          name: product,
          size: size,
          price: price,
          image: image,
          gelar: gelar,
        });

        // Cek stok
        const productItem = data.find((p: any) => p.name === product);
        if (productItem && size) {
          const stockKey = `stock_${size.toLowerCase()}`;
          const availableStock = productItem[stockKey] || 0;
          setMaxStock(availableStock);

          // Simpan semua stok per size
          setAvailableSizes({
            S: productItem.stock_s || 0,
            M: productItem.stock_m || 0,
            L: productItem.stock_l || 0,
            XL: productItem.stock_xl || 0,
          });

          if (quantity > availableStock && availableStock > 0) {
            setQuantity(availableStock);
          }
        }
      });
  }, [searchParams]);

  const copyToClipboard = async (text: string, bank: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedBank(bank);
    setTimeout(() => setCopiedBank(null), 2000);
  };

  const increaseQuantity = () => {
    if (quantity < maxStock) {
      setQuantity(quantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const changeSize = (newSize: string) => {
    const productItem = products.find((p: any) => p.name === productData?.name);
    if (productItem) {
      const stockKey = `stock_${newSize.toLowerCase()}`;
      const newStock = productItem[stockKey] || 0;

      if (newStock > 0) {
        setProductData({
          ...productData!,
          size: newSize,
          price: productItem.price.toString(),
          image: productItem.image_url,
        });
        setMaxStock(newStock);
        setQuantity(1);
        setShowSizeSelector(false);
      }
    }
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

    if (quantity === 0) {
      newErrors.quantity = "Stok habis, pilih ukuran lain";
    } else if (quantity > maxStock) {
      newErrors.quantity = `Stok tersisa ${maxStock} pcs`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!productData) return;
    if (!validateForm()) return;

    setLoading(true);

    try {
      const paymentMethodText = "Transfer Bank (BCA/Mandiri)";
      const totalPrice = parseInt(productData.price || "0") * quantity;

      const res = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: formData.customerName.trim(),
          customer_phone: formData.customerPhone.replace(/\s/g, ""),
          customer_address: formData.customerAddress.trim(),
          product_name: productData.name,
          product_gelar: productData.gelar,
          size: productData.size,
          quantity: quantity,
          total_price: totalPrice,
          payment_method: paymentMethodText,
          notes: formData.notes.trim(),
        }),
      });

      if (res.ok) {
        setSuccess(true);
      } else {
        const error = await res.json();
        alert(error.error || "Gagal memproses order");
      }
    } catch (err) {
      alert("Gagal memproses order");
    }

    setLoading(false);
  };

  if (success) {
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
Produk: ${productData?.name} ${productData?.gelar ? `- ${productData.gelar}` : ""}
Ukuran: ${productData?.size}
Jumlah: ${quantity} pcs
Total: Rp ${(parseInt(productData?.price || "0") * quantity).toLocaleString("id-ID")}

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

  if (!productData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-black">Loading...</div>
      </div>
    );
  }

  const totalPrice = parseInt(productData.price || "0") * quantity;

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

        {/* Ringkasan Pesanan - Bisa diedit */}
        <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <div className="flex gap-3">
            <div className="relative w-16 h-16 bg-gray-100 rounded overflow-hidden">
              <Image
                src={productData.image || "/models/logo.png"}
                alt={productData.name || "Product Image"}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-bold text-black">{productData.name}</h3>
                <button
                  onClick={() => router.push("/")} // Mengarahkan ke halaman utama untuk memilih produk lain
                  className="text-[10px] text-gray-400 underline hover:text-black"
                >
                  Ubah
                </button>
              </div>
              {productData.gelar && (
                <p className="text-xs text-gray-500">{productData.gelar}</p>
              )}
              <div className="mt-2 flex flex-col gap-0.5">
                <p className="text-xs text-gray-600">
                  Ukuran: <span className="font-bold">{productData.size}</span>
                  <button
                    type="button"
                    onClick={() => setShowSizeSelector(!showSizeSelector)}
                    className="text-xs text-blue-600 hover:text-blue-800 ml-2"
                  >
                    {showSizeSelector ? "Tutup" : "Ganti"}
                  </button>
                </p>
                <p className="text-[10px] text-gray-400">
                  Tersedia: {maxStock} pcs
                </p>
              </div>
              <p className="text-sm font-bold text-black mt-2">
                {/* Harga per pcs */}
                {/* Memastikan harga ditampilkan dengan benar */}
                Rp {parseInt(productData.price || "0").toLocaleString("id-ID")}
              </p>
            </div>
          </div>

          {/* Size Selector Dropdown */}
          {showSizeSelector && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-2">Pilih Ukuran Lain:</p>
              <div className="flex gap-2">
                {["S", "M", "L", "XL"].map((size) => {
                  const stock =
                    availableSizes[size as keyof typeof availableSizes];
                  const isAvailable = stock > 0;
                  const isActive = productData.size === size;
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => isAvailable && changeSize(size)}
                      disabled={!isAvailable}
                      className={`w-12 py-2 text-sm rounded-md border transition ${
                        isActive
                          ? "border-black bg-black text-white"
                          : isAvailable
                            ? "border-gray-300 text-black hover:border-black"
                            : "border-gray-100 text-gray-300 cursor-not-allowed"
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex justify-between items-center">
              <p className="text-sm text-black">Jumlah</p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1 || maxStock === 0}
                  className="w-7 h-7 rounded-full border border-gray-300 text-black disabled:opacity-50 hover:bg-gray-100"
                >
                  -
                </button>
                <span className="text-base font-bold text-black w-6 text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={increaseQuantity}
                  disabled={quantity >= maxStock || maxStock === 0}
                  className="w-7 h-7 rounded-full border border-gray-300 text-black disabled:opacity-50 hover:bg-gray-100"
                >
                  +
                </button>
              </div>
            </div>
            {errors.quantity && (
              <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>
            )}
          </div>
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
            disabled={loading || maxStock === 0}
            className="w-full mt-4 py-3 bg-black text-white text-sm font-medium rounded-full hover:bg-gray-800 transition disabled:bg-gray-400"
          >
            {loading
              ? "Memproses..."
              : maxStock === 0
                ? "Stok Habis"
                : "Buat Pesanan"}
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
