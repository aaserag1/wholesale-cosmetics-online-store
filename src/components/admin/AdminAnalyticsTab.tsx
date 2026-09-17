"use client";

interface Order {
  id: number;
  status: string;
  total: string;
  customerName?: string | null;
  businessName?: string | null;
  createdAt: string;
  items?: {
    id: number;
    productName: string;
    price: string;
    quantity: number;
  }[];
}

interface Product {
  id: number;
  nameAr: string;
  price: string;
  stock: number;
  categoryName: string | null;
  image: string | null;
}

interface User {
  id: number;
  name: string;
  businessName: string | null;
  orderCount: number;
  totalSpent: number;
}

export default function AdminAnalyticsTab({
  orders,
  products,
  users,
}: {
  orders: Order[];
  products: Product[];
  users: User[];
}) {
  const nonCancelledOrders = orders.filter((o) => o.status !== "cancelled");
  const totalRevenue = nonCancelledOrders.reduce(
    (sum, o) => sum + parseFloat(o.total || "0"),
    0
  );
  const deliveredRevenue = orders
    .filter((o) => o.status === "delivered")
    .reduce((sum, o) => sum + parseFloat(o.total || "0"), 0);

  const avgOrderValue =
    nonCancelledOrders.length > 0 ? totalRevenue / nonCancelledOrders.length : 0;

  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const processingCount = orders.filter((o) => o.status === "processing").length;
  const shippedCount = orders.filter((o) => o.status === "shipped").length;
  const deliveredCount = orders.filter((o) => o.status === "delivered").length;
  const cancelledCount = orders.filter((o) => o.status === "cancelled").length;

  const lowStockProducts = products.filter((p) => p.stock <= 20);
  const outOfStockProducts = products.filter((p) => p.stock === 0);

  // Calculate top products sold
  const productSalesMap: Record<string, { name: string; quantity: number; revenue: number }> = {};
  for (const order of nonCancelledOrders) {
    if (order.items) {
      for (const item of order.items) {
        if (!productSalesMap[item.productName]) {
          productSalesMap[item.productName] = {
            name: item.productName,
            quantity: 0,
            revenue: 0,
          };
        }
        productSalesMap[item.productName].quantity += item.quantity;
        productSalesMap[item.productName].revenue +=
          item.quantity * parseFloat(item.price || "0");
      }
    }
  }

  const topProducts = Object.values(productSalesMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Top spending clients
  const topSpenders = [...users].sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 5);

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 text-xs font-bold">إجمالي مبيعات الجملة</span>
            <span className="text-2xl">💰</span>
          </div>
          <p className="text-2xl md:text-3xl font-black text-gray-900">
            {totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ج.م
          </p>
          <span className="text-[11px] text-green-600 font-bold mt-1 block">
            ✓ محصل ومؤكد: {deliveredRevenue.toLocaleString()} ج.م
          </span>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 text-xs font-bold">إجمالي الطلبيات</span>
            <span className="text-2xl">📦</span>
          </div>
          <p className="text-2xl md:text-3xl font-black gradient-text">{orders.length}</p>
          <span className="text-[11px] text-amber-600 font-bold mt-1 block">
            ⏳ قيد الانتظار: {pendingCount} طلب
          </span>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 text-xs font-bold">متوسط الفاتورة (AOV)</span>
            <span className="text-2xl">📊</span>
          </div>
          <p className="text-2xl md:text-3xl font-black text-gray-900">
            {avgOrderValue.toFixed(0)} ج.م
          </p>
          <span className="text-[11px] text-primary font-bold mt-1 block">
            الحد الأدنى: 1,000 ج.م
          </span>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 text-xs font-bold">تنبيهات المخزون</span>
            <span className="text-2xl">⚠️</span>
          </div>
          <p className="text-2xl md:text-3xl font-black text-red-600">
            {lowStockProducts.length}
          </p>
          <span className="text-[11px] text-red-500 font-semibold mt-1 block">
            منها {outOfStockProducts.length} صنف نفد تماماً
          </span>
        </div>
      </div>

      {/* Order Status Distribution */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
        <h3 className="font-black text-base text-gray-900 mb-4 flex items-center gap-2">
          <span>🔄</span> توزيع حالات الطلبيات
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="bg-amber-50 border border-amber-200/60 rounded-2xl p-3 text-center">
            <span className="text-xs text-amber-700 font-bold block mb-1">⏳ في الانتظار</span>
            <span className="text-xl font-black text-amber-900">{pendingCount}</span>
          </div>
          <div className="bg-purple-50 border border-purple-200/60 rounded-2xl p-3 text-center">
            <span className="text-xs text-purple-700 font-bold block mb-1">📦 قيد التجهيز</span>
            <span className="text-xl font-black text-purple-900">{processingCount}</span>
          </div>
          <div className="bg-indigo-50 border border-indigo-200/60 rounded-2xl p-3 text-center">
            <span className="text-xs text-indigo-700 font-bold block mb-1">🚚 تم الشحن</span>
            <span className="text-xl font-black text-indigo-900">{shippedCount}</span>
          </div>
          <div className="bg-green-50 border border-green-200/60 rounded-2xl p-3 text-center">
            <span className="text-xs text-green-700 font-bold block mb-1">🎉 تم التوصيل</span>
            <span className="text-xl font-black text-green-900">{deliveredCount}</span>
          </div>
          <div className="bg-red-50 border border-red-200/60 rounded-2xl p-3 text-center">
            <span className="text-xs text-red-700 font-bold block mb-1">❌ ملغاة</span>
            <span className="text-xl font-black text-red-900">{cancelledCount}</span>
          </div>
        </div>
      </div>

      {/* Top Products & Top Customers */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Top Selling Products */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <h3 className="font-black text-base text-gray-900 mb-4 flex items-center gap-2">
            <span>⭐</span> أكثر المنتجات طلباً
          </h3>
          {topProducts.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">لا توجد بيانات مبيعات بعد</p>
          ) : (
            <div className="space-y-3">
              {topProducts.map((p, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 border border-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary font-black text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-xs text-gray-800 line-clamp-1">{p.name}</span>
                  </div>
                  <div className="text-left shrink-0">
                    <span className="text-xs font-black text-gray-900 block">
                      {p.revenue.toLocaleString()} ج.م
                    </span>
                    <span className="text-[10px] text-gray-500 font-medium">
                      {p.quantity} قطعة
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Spenders */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <h3 className="font-black text-base text-gray-900 mb-4 flex items-center gap-2">
            <span>🏢</span> كبار عملاء الصالونات والمتاجر
          </h3>
          {topSpenders.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">لا توجد بيانات عملاء بعد</p>
          ) : (
            <div className="space-y-3">
              {topSpenders.map((u, idx) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 border border-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-secondary/10 text-secondary font-black text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <span className="font-bold text-xs text-gray-800 block">
                        {u.businessName || u.name}
                      </span>
                      {u.businessName && (
                        <span className="text-[10px] text-gray-500 block">المسؤول: {u.name}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-left shrink-0">
                    <span className="text-xs font-black text-gray-900 block">
                      {u.totalSpent.toLocaleString()} ج.م
                    </span>
                    <span className="text-[10px] text-gray-500 font-medium">
                      {u.orderCount} طلب
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
