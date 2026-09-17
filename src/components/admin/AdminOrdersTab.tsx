"use client";

import { useState } from "react";

interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  price: string;
  quantity: number;
  packageUnit?: string | null;
  image?: string | null;
}

interface Order {
  id: number;
  userId: number;
  status: string;
  total: string;
  shippingAddress: string;
  shippingCity: string | null;
  shippingPhone: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  customerName?: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;
  businessName?: string | null;
  taxId?: string | null;
  items: OrderItem[];
}

const statusOptions = [
  { value: "pending", label: "⏳ في الانتظار" },
  { value: "confirmed", label: "✅ تم التأكيد" },
  { value: "processing", label: "📦 قيد التجهيز" },
  { value: "shipped", label: "🚚 تم الشحن" },
  { value: "delivered", label: "🎉 تم التوصيل" },
  { value: "cancelled", label: "❌ ملغي" },
];

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  confirmed: "bg-blue-100 text-blue-800 border-blue-200",
  processing: "bg-purple-100 text-purple-800 border-purple-200",
  shipped: "bg-indigo-100 text-indigo-800 border-indigo-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

export default function AdminOrdersTab({
  orders,
  onUpdateStatus,
  updatingId,
}: {
  orders: Order[];
  onUpdateStatus: (orderId: number, status: string) => Promise<void>;
  updatingId: number | null;
}) {
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = selectedStatus === "all" || o.status === selectedStatus;
    const query = search.toLowerCase().trim();
    if (!query) return matchesStatus;

    const matchesQuery =
      String(o.id).includes(query) ||
      (o.customerName && o.customerName.toLowerCase().includes(query)) ||
      (o.businessName && o.businessName.toLowerCase().includes(query)) ||
      (o.shippingPhone && o.shippingPhone.includes(query)) ||
      (o.customerPhone && o.customerPhone.includes(query));

    return matchesStatus && matchesQuery;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="w-full sm:w-80 relative">
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            type="text"
            placeholder="ابحث برقم الطلب، العميل، الصالون، أو الهاتف..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
          <button
            onClick={() => setSelectedStatus("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedStatus === "all"
                ? "bg-gray-900 text-white shadow-sm"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100"
            }`}
          >
            الكل ({orders.length})
          </button>
          {statusOptions.map((st) => {
            const count = orders.filter((o) => o.status === st.value).length;
            return (
              <button
                key={st.value}
                onClick={() => setSelectedStatus(st.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedStatus === st.value
                    ? "bg-primary text-white shadow-sm"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
              >
                {st.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders Table */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-sm">
          <span className="text-5xl block mb-3">📭</span>
          <h3 className="text-lg font-bold text-gray-800 mb-1">لا توجد طلبيات مطابقة</h3>
          <p className="text-gray-500 text-xs">جرب تغيير معايير البحث أو اختيار حالة أخرى</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-600">
                <tr>
                  <th className="py-3.5 px-4 font-black">رقم الطلب</th>
                  <th className="py-3.5 px-4 font-black">الصالون / العميل</th>
                  <th className="py-3.5 px-4 font-black">التاريخ</th>
                  <th className="py-3.5 px-4 font-black">الأصناف</th>
                  <th className="py-3.5 px-4 font-black">إجمالي الفاتورة</th>
                  <th className="py-3.5 px-4 font-black">الحالة</th>
                  <th className="py-3.5 px-4 font-black text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-pink-50/20 transition-colors">
                    <td className="py-3.5 px-4 font-black text-gray-900">
                      #{order.id}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-gray-900 block">
                        {order.businessName || order.customerName || "عميل جملة"}
                      </span>
                      {order.businessName && order.customerName && (
                        <span className="text-[11px] text-gray-500 block">
                          المسؤول: {order.customerName}
                        </span>
                      )}
                      <span className="text-[11px] text-gray-400 block" dir="ltr">
                        {order.shippingPhone || order.customerPhone || ""}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-gray-500 whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString("ar-EG", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-md">
                        {order.items?.length || 0} صنف
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-black text-gray-900">
                      {parseFloat(order.total).toLocaleString()} ج.م
                    </td>

                    <td className="py-3.5 px-4">
                      <select
                        value={order.status}
                        disabled={updatingId === order.id}
                        onChange={(e) => onUpdateStatus(order.id, e.target.value)}
                        className={`text-xs font-bold px-2.5 py-1 rounded-full border cursor-pointer focus:outline-none ${
                          statusColors[order.status] || "bg-gray-100 text-gray-800 border-gray-200"
                        }`}
                      >
                        {statusOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="bg-gray-100 hover:bg-primary hover:text-white text-gray-700 px-2.5 py-1 rounded-lg text-xs font-bold transition-all"
                          title="عرض التفاصيل الكاملة"
                        >
                          👁️ تفاصيل
                        </button>
                        <button
                          onClick={() => setInvoiceOrder(order)}
                          className="bg-purple-50 hover:bg-secondary hover:text-white text-secondary px-2.5 py-1 rounded-lg text-xs font-bold transition-all border border-purple-100"
                          title="طباعة الفاتورة الضريبية"
                        >
                          🧾 فاتورة
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 animate-slide-down">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
              <div>
                <h3 className="text-xl font-black text-gray-900">
                  تفاصيل طلب الجملة #{selectedOrder.id}
                </h3>
                <span className="text-xs text-gray-500">
                  تاريخ الطلب: {new Date(selectedOrder.createdAt).toLocaleString("ar-EG")}
                </span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            {/* Customer & Salon Details */}
            <div className="grid sm:grid-cols-2 gap-4 bg-pink-50/50 p-4 rounded-2xl border border-pink-100 mb-6">
              <div>
                <span className="text-xs font-bold text-gray-500 block mb-1">بيانات العميل والنشاط</span>
                <p className="font-bold text-sm text-gray-900">
                  {selectedOrder.businessName || "حساب شخصي"}
                </p>
                <p className="text-xs text-gray-600">المسؤول: {selectedOrder.customerName || "غير محدد"}</p>
                <p className="text-xs text-gray-600">البريد: {selectedOrder.customerEmail || "غير محدد"}</p>
                <p className="text-xs text-gray-600" dir="ltr">
                  هاتف: {selectedOrder.shippingPhone || selectedOrder.customerPhone || "لا يوجد"}
                </p>
                {selectedOrder.taxId && (
                  <p className="text-xs text-gray-600 font-mono">
                    السجل الضريبي: {selectedOrder.taxId}
                  </p>
                )}
              </div>

              <div>
                <span className="text-xs font-bold text-gray-500 block mb-1">عنوان التسليم والتوريد</span>
                <p className="text-xs text-gray-700 font-semibold">
                  المحافظة: {selectedOrder.shippingCity || "غير محددة"}
                </p>
                <p className="text-xs text-gray-700 mt-1 leading-relaxed">
                  العنوان: {selectedOrder.shippingAddress}
                </p>
                {selectedOrder.notes && (
                  <div className="mt-2 bg-amber-50 p-2 rounded-xl border border-amber-200 text-amber-900 text-xs">
                    ملاحظات: {selectedOrder.notes}
                  </div>
                )}
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-6">
              <h4 className="font-black text-sm text-gray-900 mb-3">📦 الأصناف المطلوبة</h4>
              <div className="border border-gray-100 rounded-2xl overflow-hidden">
                <table className="w-full text-right text-xs">
                  <thead className="bg-gray-50 border-b border-gray-100 text-gray-600">
                    <tr>
                      <th className="py-2.5 px-3">المنتج</th>
                      <th className="py-2.5 px-3">الوحدة</th>
                      <th className="py-2.5 px-3">السعر بعد الخصم</th>
                      <th className="py-2.5 px-3">الكمية</th>
                      <th className="py-2.5 px-3">الإجمالي</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {selectedOrder.items?.map((item) => (
                      <tr key={item.id}>
                        <td className="py-2.5 px-3 font-bold text-gray-800">
                          {item.productName}
                        </td>
                        <td className="py-2.5 px-3 text-gray-500">
                          {item.packageUnit || "قطعة"}
                        </td>
                        <td className="py-2.5 px-3 font-bold">
                          {parseFloat(item.price).toFixed(2)} ج.م
                        </td>
                        <td className="py-2.5 px-3 font-black text-primary">
                          {item.quantity}
                        </td>
                        <td className="py-2.5 px-3 font-black text-gray-900">
                          {(parseFloat(item.price) * item.quantity).toLocaleString()} ج.م
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Total Bar */}
            <div className="bg-gray-50 p-4 rounded-2xl flex items-center justify-between font-black text-base border border-gray-100 mb-6">
              <span>إجمالي الطلب:</span>
              <span className="text-xl text-primary font-black">
                {parseFloat(selectedOrder.total).toLocaleString()} ج.م
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <button
                onClick={() => {
                  setInvoiceOrder(selectedOrder);
                  setSelectedOrder(null);
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all"
              >
                <span>🧾</span> فتح وطباعة الفاتورة الضريبية
              </button>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-600">تحديث الحالة:</span>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => {
                    onUpdateStatus(selectedOrder.id, e.target.value);
                    setSelectedOrder({ ...selectedOrder, status: e.target.value });
                  }}
                  className={`text-xs font-bold px-3 py-2 rounded-xl border focus:outline-none ${
                    statusColors[selectedOrder.status]
                  }`}
                >
                  {statusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Printable B2B Tax Invoice Modal */}
      {invoiceOrder && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-gray-100">
            {/* Header / Actions */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 mb-6 print:hidden">
              <span className="text-sm font-bold text-gray-500">معاينة الفاتورة الضريبية للطباعة</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="bg-primary hover:bg-pink-600 text-white px-6 py-2 rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                >
                  <span>🖨️</span> طباعة الآن (Print / Save PDF)
                </button>
                <button
                  onClick={() => setInvoiceOrder(null)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center font-bold text-xs"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Printable Content */}
            <div id="printable-invoice" className="text-right p-4 border border-gray-200 rounded-2xl">
              {/* Invoice Brand Header */}
              <div className="flex justify-between items-start border-b-2 border-primary/30 pb-6 mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-3xl">💄</span>
                    <span className="text-2xl font-black text-gray-900">BeautyMart B2B</span>
                  </div>
                  <p className="text-xs text-gray-500 font-medium">شركة توريد مستحضرات التجميل بالجملة</p>
                  <p className="text-xs text-gray-500 font-mono mt-1">السجل التجاري: CR-48920194</p>
                  <p className="text-xs text-gray-500 font-mono">البطاقة الضريبية: TR-98421044</p>
                </div>

                <div className="text-left">
                  <span className="inline-block bg-pink-100 text-primary text-xs font-black px-3 py-1 rounded-full mb-2">
                    فاتورة مبيعات جملة رسمية
                  </span>
                  <p className="text-xs font-bold text-gray-800">رقم الفاتورة: #{invoiceOrder.id}</p>
                  <p className="text-xs text-gray-500">
                    التاريخ: {new Date(invoiceOrder.createdAt).toLocaleDateString("ar-EG")}
                  </p>
                </div>
              </div>

              {/* Bill To Info */}
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl mb-6 text-xs">
                <div>
                  <span className="font-bold text-gray-400 block mb-1">بيانات العميل / الصالون:</span>
                  <p className="font-black text-sm text-gray-900 mb-0.5">
                    {invoiceOrder.businessName || invoiceOrder.customerName}
                  </p>
                  <p className="text-gray-600">المسؤول: {invoiceOrder.customerName || "—"}</p>
                  <p className="text-gray-600" dir="ltr">الهاتف: {invoiceOrder.shippingPhone || "—"}</p>
                  {invoiceOrder.taxId && (
                    <p className="text-gray-600 font-mono">الرقم الضريبي: {invoiceOrder.taxId}</p>
                  )}
                </div>

                <div>
                  <span className="font-bold text-gray-400 block mb-1">عنوان التسليم والتوريد:</span>
                  <p className="text-gray-700 font-bold">{invoiceOrder.shippingCity}</p>
                  <p className="text-gray-600 leading-relaxed">{invoiceOrder.shippingAddress}</p>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-right text-xs mb-6 border border-gray-200">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="py-2.5 px-3 font-black">م</th>
                    <th className="py-2.5 px-3 font-black">الصنف والمواصفات</th>
                    <th className="py-2.5 px-3 font-black">وحدة التعبئة</th>
                    <th className="py-2.5 px-3 font-black">الكمية</th>
                    <th className="py-2.5 px-3 font-black">سعر الجملة</th>
                    <th className="py-2.5 px-3 font-black">الإجمالي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {invoiceOrder.items?.map((item, index) => (
                    <tr key={item.id}>
                      <td className="py-2.5 px-3 text-gray-500">{index + 1}</td>
                      <td className="py-2.5 px-3 font-bold text-gray-800">{item.productName}</td>
                      <td className="py-2.5 px-3 text-gray-600">{item.packageUnit || "قطعة"}</td>
                      <td className="py-2.5 px-3 font-black text-gray-900">{item.quantity}</td>
                      <td className="py-2.5 px-3 font-mono">{parseFloat(item.price).toFixed(2)} ج.م</td>
                      <td className="py-2.5 px-3 font-black font-mono">
                        {(parseFloat(item.price) * item.quantity).toLocaleString()} ج.م
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals & Signatures */}
              <div className="flex justify-between items-end pt-4 border-t border-gray-200">
                <div className="text-xs text-gray-500 space-y-1">
                  <p>• الأسعار تشمل خصومات الكميات التلقائية المعتمدة للصالونات.</p>
                  <p>• البضاعة المباعة ترد وتستبدل طبقاً للشروط التجارية المعتمدة.</p>
                  <div className="pt-4 flex gap-12 text-gray-700 font-bold">
                    <span>توقيع المستلم: ____________</span>
                    <span>الختم الرسمي: ____________</span>
                  </div>
                </div>

                <div className="bg-pink-50 p-4 rounded-xl border border-pink-200 text-left min-w-[200px]">
                  <span className="text-xs font-bold text-gray-600 block mb-1">المبلغ الإجمالي المستحق:</span>
                  <span className="text-2xl font-black text-primary block">
                    {parseFloat(invoiceOrder.total).toLocaleString()} ج.م
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
