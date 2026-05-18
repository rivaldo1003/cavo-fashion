"use client";

import { useState } from "react";
import Image from "next/image";

interface ProductTabProps {
  products: any[];
  updateStock: (
    id: number,
    stocks: {
      stock_s: number;
      stock_m: number;
      stock_l: number;
      stock_xl: number;
    },
  ) => Promise<boolean>; // ← Ubah dari Promise<void> ke Promise<boolean>
  updateProductDetails: (id: number, form: any) => Promise<void>;
  uploadImage: (id: number, file: File) => Promise<void>;
}

export default function ProductTab({
  products,
  updateStock,
  updateProductDetails,
  uploadImage,
}: ProductTabProps) {
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [uploadingImage, setUploadingImage] = useState<any>(null);
  const [savingStockId, setSavingStockId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    gelar: "",
    theme: "",
    price: 0,
  });

  // State untuk menyimpan nilai stok sementara per produk
  const [stockValues, setStockValues] = useState<{
    [key: number]: {
      stock_s: number;
      stock_m: number;
      stock_l: number;
      stock_xl: number;
    };
  }>({});

  const faithArchives = products.filter((p) => p.category === "FAITH ARCHIVES");
  const essentials = products.find((p) => p.category === "ESSENTIALS");

  // Inisialisasi atau update stock values
  const getStockValues = (product: any) => {
    if (!stockValues[product.id]) {
      return {
        stock_s: product.stock_s || 0,
        stock_m: product.stock_m || 0,
        stock_l: product.stock_l || 0,
        stock_xl: product.stock_xl || 0,
      };
    }
    return stockValues[product.id];
  };

  const handleStockChange = (
    productId: number,
    size: string,
    value: string,
  ) => {
    const numValue = parseInt(value) || 0;
    const sizeKey = `stock_${size.toLowerCase()}`;

    setStockValues((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [sizeKey]: numValue,
      },
    }));
  };

  const handleSaveStock = async (productId: number) => {
    const stocks = stockValues[productId];
    if (!stocks) return;

    setSavingStockId(productId);
    try {
      await updateStock(productId, stocks);
      // Berhasil, bisa kasih notifikasi atau biarkan state tetap
    } catch (error) {
      console.error("Error saving stock:", error);
    } finally {
      setSavingStockId(null);
    }
  };

  return (
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
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded text-black"
                placeholder="Nama"
              />
              <input
                type="text"
                value={editForm.gelar}
                onChange={(e) =>
                  setEditForm({ ...editForm, gelar: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded text-black"
                placeholder="Gelar"
              />
              <input
                type="text"
                value={editForm.theme}
                onChange={(e) =>
                  setEditForm({ ...editForm, theme: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded text-black"
                placeholder="Theme"
              />
              <input
                type="number"
                value={editForm.price}
                onChange={(e) =>
                  setEditForm({ ...editForm, price: parseInt(e.target.value) })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded text-black"
                placeholder="Harga"
              />
              <div className="flex gap-2 pt-2">
                <button
                  onClick={async () => {
                    await updateProductDetails(editingProduct.id, editForm);
                    setEditingProduct(null);
                  }}
                  className="flex-1 bg-black text-white py-2 rounded hover:bg-gray-800"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingProduct(null)}
                  className="flex-1 bg-gray-100 text-black py-2 rounded"
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
            <h2 className="text-lg font-bold text-black mb-4">Upload Foto</h2>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  uploadImage(uploadingImage.id, e.target.files[0]);
                  setUploadingImage(null);
                }
              }}
              className="w-full text-black text-sm"
            />
            <button
              onClick={() => setUploadingImage(null)}
              className="w-full mt-4 bg-gray-100 text-black py-2 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* FAITH ARCHIVES SECTION */}
      <div className="mb-8">
        <h2 className="text-base font-bold text-black mb-3">Faith Archives</h2>
        <div className="space-y-3">
          {faithArchives.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              stockValues={getStockValues(product)}
              savingStock={savingStockId === product.id}
              onStockChange={(size: string, value: string) =>
                handleStockChange(product.id, size, value)
              }
              onSaveStock={() => handleSaveStock(product.id)}
              onEdit={() => {
                setEditingProduct(product);
                setEditForm({
                  name: product.name,
                  gelar: product.gelar || "",
                  theme: product.theme || "",
                  price: product.price,
                });
              }}
              onUpload={() => setUploadingImage(product)}
            />
          ))}
        </div>
      </div>

      {/* ESSENTIALS SECTION */}
      {essentials && (
        <div>
          <h2 className="text-base font-bold text-black mb-3">Essentials</h2>
          <ProductCard
            product={essentials}
            stockValues={getStockValues(essentials)}
            savingStock={savingStockId === essentials.id}
            onStockChange={(size: string, value: string) =>
              handleStockChange(essentials.id, size, value)
            }
            onSaveStock={() => handleSaveStock(essentials.id)}
            onEdit={() => {
              setEditingProduct(essentials);
              setEditForm({
                name: essentials.name,
                gelar: essentials.gelar || "",
                theme: essentials.theme || "",
                price: essentials.price,
              });
            }}
            onUpload={() => setUploadingImage(essentials)}
          />
        </div>
      )}
    </>
  );
}

// ProductCard Component dengan TOMBOL SIMPAN
function ProductCard({
  product,
  stockValues,
  savingStock,
  onStockChange,
  onSaveStock,
  onEdit,
  onUpload,
}: any) {
  return (
    <div className="border border-gray-100 rounded p-4">
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
              <h3 className="font-bold text-black">{product.name}</h3>
              <p className="text-xs text-gray-500">
                {product.gelar || "Black Edition"}
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
                onClick={onEdit}
                className="text-xs bg-gray-100 text-black px-3 py-1 rounded mr-2 hover:bg-gray-200"
              >
                Edit
              </button>
              <button
                onClick={onUpload}
                className="text-xs bg-gray-100 text-black px-3 py-1 rounded hover:bg-gray-200"
              >
                Upload
              </button>
            </div>
          </div>

          {/* Stock Inputs dengan TOMBOL SIMPAN */}
          <div className="mt-3 pt-3 border-t border-gray-50">
            <div className="grid grid-cols-4 gap-3 mb-3">
              {["S", "M", "L", "XL"].map((size) => {
                const stockKey = `stock_${size.toLowerCase()}`;
                return (
                  <div key={size}>
                    <label className="text-xs text-gray-500 block mb-1">
                      {size}
                    </label>
                    <input
                      type="number"
                      value={stockValues[stockKey] || 0}
                      onChange={(e) => onStockChange(size, e.target.value)}
                      className="w-full px-2 py-1 border border-gray-200 rounded text-sm text-black"
                      min="0"
                    />
                  </div>
                );
              })}
            </div>

            {/* TOMBOL SIMPAN */}
            <button
              onClick={onSaveStock}
              disabled={savingStock}
              className="w-full bg-black text-white py-2 rounded text-sm hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
            >
              {savingStock ? "Menyimpan..." : "💾 Simpan Stok"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
