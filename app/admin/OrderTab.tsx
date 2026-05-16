"use client";

import { useState } from "react";

interface OrderTabProps {
  orders: any[];
  loading: boolean;
  updateStatus: (id: number, status: string) => Promise<void>;
}

export default function OrderTab({
  orders,
  loading,
  updateStatus,
}: OrderTabProps) {
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

  const getStatusBadge = (status: string) => {
    const colors: any = {
      pending: "bg-yellow-100 text-yellow-800",
      paid: "bg-blue-100 text-blue-800",
      shipped: "bg-purple-100 text-purple-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusText = (status: string) => {
    const texts: any = {
      pending: "Menunggu Pembayaran",
      paid: "Sudah Dibayar",
      shipped: "Dikirim",
      delivered: "Selesai",
      cancelled: "Dibatalkan",
    };
    return texts[status] || status;
  };

  const generateInvoice = (order: any) => {
    const invoiceHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>INVOICE ${order.order_number}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Helvetica Neue', Arial, sans-serif;
          background: #f0f0f0;
          padding: 40px 20px;
        }
        .invoice {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          border-radius: 4px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.1);
          overflow: hidden;
        }
        .invoice-header {
          background: black;
          color: white;
          padding: 30px;
          text-align: center;
        }
        .logo {
          font-size: 28px;
          font-weight: 300;
          letter-spacing: 8px;
          margin-bottom: 8px;
        }
        .tagline {
          font-size: 9px;
          letter-spacing: 3px;
          opacity: 0.7;
          font-style: italic;
        }
        .invoice-body {
          padding: 30px;
        }
        .invoice-title {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 2px solid #000;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 30px;
        }
        .info-box h3 {
          font-size: 10px;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: #666;
          margin-bottom: 8px;
        }
        .info-box p {
          font-size: 13px;
          color: #000;
          line-height: 1.5;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        .items-table th {
          text-align: left;
          padding: 12px 8px;
          background: #f5f5f5;
          font-size: 10px;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 1px;
          border-bottom: 1px solid #ddd;
        }
        .items-table td {
          padding: 12px 8px;
          border-bottom: 1px solid #eee;
          font-size: 12px;
        }
        .total-row {
          text-align: right;
          margin-top: 20px;
          padding-top: 20px;
          border-top: 2px solid #000;
        }
        .total-row p {
          font-size: 16px;
          font-weight: bold;
        }
        .footer {
          text-align: center;
          padding: 20px 30px;
          background: #fafafa;
          font-size: 10px;
          color: #999;
          border-top: 1px solid #eee;
        }
        .footer-tagline {
          font-style: italic;
          margin-bottom: 8px;
        }
        button {
          background: black;
          color: white;
          border: none;
          padding: 8px 16px;
          font-size: 11px;
          cursor: pointer;
          margin-top: 10px;
          border-radius: 3px;
        }
        button:hover {
          background: #333;
        }
        @media print {
          body { background: white; padding: 0; }
          .no-print { display: none; }
          .invoice { box-shadow: none; }
        }
      </style>
    </head>
    <body>
      <div class="invoice">
        <div class="invoice-header">
          <div class="logo">CAVO</div>
          <div class="tagline">Minimum Form. Maximum Presence.</div>
        </div>
        <div class="invoice-body">
          <div class="invoice-title">INVOICE</div>
          
          <div class="info-grid">
            <div class="info-box">
              <h3>INVOICE TO</h3>
              <p>
                <strong>${order.customer_name}</strong><br>
                ${order.customer_phone}<br>
                ${order.customer_address}
              </p>
            </div>
            <div class="info-box">
              <h3>ORDER DETAILS</h3>
              <p>
                <strong>Order Number:</strong> ${order.order_number}<br>
                <strong>Date:</strong> ${new Date(order.created_at).toLocaleDateString("id-ID")}<br>
                <strong>Status:</strong> ${getStatusText(order.status)}
              </p>
            </div>
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Size</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${order.product_name} ${order.product_gelar ? `- ${order.product_gelar}` : ""}</td>
                <td>${order.size}</td>
                <td>${order.quantity}</td>
                <td>Rp ${(order.total_price / order.quantity).toLocaleString("id-ID")}</td>
                <td>Rp ${order.total_price.toLocaleString("id-ID")}</td>
              </tr>
            </tbody>
          </table>

          <div class="total-row">
            <p>TOTAL: Rp ${order.total_price.toLocaleString("id-ID")}</p>
          </div>
        </div>
        <div class="footer">
          <div class="footer-tagline">Minimum Form. Maximum Presence.</div>
          <p>Terima kasih telah berbelanja di CAVO</p>
          <p style="margin-top: 4px; font-size: 8px;">Ordinary people. Extraordinary calling.</p>
        </div>
      </div>
      <div class="no-print" style="text-align: center; margin-top: 20px;">
        <button onclick="window.print()">🖨️ PRINT INVOICE</button>
      </div>
    </body>
    </html>
  `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(invoiceHtml);
      printWindow.document.close();
    }
  };

  if (loading)
    return (
      <div className="text-center py-12 text-gray-400">Loading orders...</div>
    );
  if (orders.length === 0)
    return (
      <div className="text-center py-12 text-gray-400">Belum ada order</div>
    );

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <div
          key={order.id}
          className="border border-gray-100 rounded-lg overflow-hidden"
        >
          {/* Header */}
          <div
            className="p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition"
            onClick={() =>
              setExpandedOrder(expandedOrder === order.id ? null : order.id)
            }
          >
            <div className="flex justify-between items-center">
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-black">
                    {order.order_number}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${getStatusBadge(order.status)}`}
                  >
                    {getStatusText(order.status)}
                  </span>
                </div>
                <div className="text-sm text-black mt-1">
                  {order.customer_name}
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

          {/* Expanded Detail */}
          {expandedOrder === order.id && (
            <div className="p-4 border-t border-gray-100 space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-gray-400">Customer</p>
                  <p className="text-black font-medium">
                    {order.customer_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {order.customer_phone}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Alamat</p>
                  <p className="text-black text-sm">{order.customer_address}</p>
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
                <p className="text-black text-sm">{order.payment_method}</p>
              </div>

              <div className="flex gap-2 pt-2 flex-wrap">
                <select
                  value={order.status}
                  onChange={(e) => updateStatus(order.id, e.target.value)}
                  className="text-xs px-3 py-1 border border-gray-300 rounded text-black bg-white"
                >
                  <option value="pending">Menunggu Pembayaran</option>
                  <option value="paid">Sudah Dibayar</option>
                  <option value="shipped">Dikirim</option>
                  <option value="delivered">Selesai</option>
                  <option value="cancelled">Dibatalkan</option>
                </select>

                <button
                  onClick={() => openWhatsApp(order, getStatusText)}
                  className="text-xs bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                >
                  WhatsApp Customer
                </button>

                {/* TOMBOL INVOICE */}
                <button
                  onClick={() => generateInvoice(order)}
                  className="text-xs bg-black text-white px-3 py-1 rounded hover:bg-gray-800"
                >
                  🧾 Invoice
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function openWhatsApp(order: any, getStatusText: Function) {
  let phoneNumber = order.customer_phone.replace(/\s/g, "").replace(/-/g, "");
  if (phoneNumber.startsWith("0"))
    phoneNumber = "62" + phoneNumber.substring(1);
  if (phoneNumber.startsWith("+")) phoneNumber = phoneNumber.substring(1);

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
Minimal Form. Maximum Presence.
================================`;

  window.open(
    `https://wa.me/${phoneNumber}?text=${encodeURIComponent(waMessage)}`,
    "_blank",
  );
}
