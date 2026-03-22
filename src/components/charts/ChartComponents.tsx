"use client";

import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"];

const formatINR = (value: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

const formatINRShort = (value: number) => {
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`;
  return `₹${value}`;
};

/* eslint-disable @typescript-eslint/no-explicit-any */
const CustomTooltip = ({ active, payload, label, prefix = "₹" }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border rounded-lg shadow-lg p-3 text-sm">
        <p className="font-medium mb-1">{label}</p>
        {payload.map((entry: any, i: number) => (
          <p key={i} style={{ color: entry.color }}>
            {entry.name}: {prefix === "₹" ? formatINR(entry.value) : `${entry.value}${prefix === "%" ? "%" : ""}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// ── Sales Trend Area Chart ─────────────────────────────────────────────────
const salesTrendData = [
  { day: "Mon", sales: 120000 },
  { day: "Tue", sales: 345000 },
  { day: "Wed", sales: 280000 },
  { day: "Thu", sales: 410000 },
  { day: "Fri", sales: 190000 },
  { day: "Sat", sales: 520000 },
  { day: "Sun", sales: 345000 },
];

export function SalesTrendChart() {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <AreaChart data={salesTrendData}>
        <defs>
          <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis dataKey="day" tick={{ fontSize: 12 }} />
        <YAxis tickFormatter={formatINRShort} tick={{ fontSize: 12 }} />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={2} fill="url(#salesGradient)" name="Sales" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ── Lead Pipeline Bar Chart ────────────────────────────────────────────────
const leadPipelineData = [
  { stage: "New", count: 45, fill: "#3b82f6" },
  { stage: "Contacted", count: 32, fill: "#10b981" },
  { stage: "Follow-up", count: 18, fill: "#f59e0b" },
  { stage: "Converted", count: 12, fill: "#8b5cf6" },
  { stage: "Lost", count: 8, fill: "#ef4444" },
];

export function LeadPipelineChart() {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={leadPipelineData}>
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis dataKey="stage" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip content={<CustomTooltip prefix="" />} />
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <Bar dataKey="count" name="Leads" radius={[4, 4, 0, 0]} label={{ position: "top", fontSize: 11 }}>
          {leadPipelineData.map((entry, i) => (
            <Cell key={i} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Revenue by Month Bar Chart ─────────────────────────────────────────────
const revenueByMonthData = [
  { month: "Oct", revenue: 1800000 },
  { month: "Nov", revenue: 2200000 },
  { month: "Dec", revenue: 2800000 },
  { month: "Jan", revenue: 2400000 },
  { month: "Feb", revenue: 3100000 },
  { month: "Mar", revenue: 2600000 },
];

export function RevenueByMonthChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={revenueByMonthData}>
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
        <YAxis tickFormatter={formatINRShort} tick={{ fontSize: 12 }} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="revenue" name="Revenue" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Vehicle Status Donut Chart ─────────────────────────────────────────────
const vehicleStatusData = [
  { name: "Available", value: 45, color: "#10b981" },
  { name: "Booked", value: 23, color: "#f59e0b" },
  { name: "Sold", value: 89, color: "#3b82f6" },
  { name: "In Transit", value: 12, color: "#f97316" },
];

export function VehicleStatusChart() {
  const total = vehicleStatusData.reduce((s, d) => s + d.value, 0);
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={vehicleStatusData} cx="50%" cy="50%" innerRadius={70} outerRadius={110} dataKey="value" nameKey="name" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
          {vehicleStatusData.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <text x="50%" y="48%" textAnchor="middle" dominantBaseline="middle" className="fill-foreground text-2xl font-bold">{total}</text>
        <text x="50%" y="56%" textAnchor="middle" dominantBaseline="middle" className="fill-muted-foreground text-xs">Total</text>
        <Tooltip content={<CustomTooltip prefix="" />} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

// ── Top Selling Models Horizontal Bar ──────────────────────────────────────
const topModelsData = [
  { model: "Hero Splendor", units: 34 },
  { model: "Honda Activa", units: 28 },
  { model: "Bajaj Pulsar", units: 22 },
  { model: "TVS Jupiter", units: 19 },
  { model: "RE Classic", units: 15 },
];

export function TopSellingModelsChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={topModelsData} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis type="number" tick={{ fontSize: 12 }} />
        <YAxis dataKey="model" type="category" width={100} tick={{ fontSize: 11 }} />
        <Tooltip content={<CustomTooltip prefix="" />} />
        <Bar dataKey="units" name="Units Sold" fill="#10b981" radius={[0, 4, 4, 0]} label={{ position: "right", fontSize: 11 }} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Daily Sales Line Chart (Sales page) ────────────────────────────────────
const dailySalesData = Array.from({ length: 30 }, (_, i) => {
  const d = new Date(2025, 2, i + 1);
  return {
    date: `${d.getDate()}/${d.getMonth() + 1}`,
    amount: Math.floor(50000 + Math.random() * 400000),
  };
});

export function DailySalesChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={dailySalesData}>
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={4} />
        <YAxis tickFormatter={formatINRShort} tick={{ fontSize: 12 }} />
        <Tooltip content={<CustomTooltip />} />
        <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} name="Sales" />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ── Sales by Payment Mode Pie ──────────────────────────────────────────────
const paymentModeData = [
  { name: "Cash", value: 35, color: "#10b981" },
  { name: "UPI", value: 28, color: "#3b82f6" },
  { name: "Bank Transfer", value: 20, color: "#8b5cf6" },
  { name: "Loan", value: 17, color: "#f59e0b" },
];

export function SalesByPaymentModeChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={paymentModeData} cx="50%" cy="50%" outerRadius={110} dataKey="value" nameKey="name" label={({ name, value }) => `${name}: ${value}%`}>
          {paymentModeData.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip formatter={(value: any) => `${value}%`} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

// ── Expense Category Pie Chart ─────────────────────────────────────────────
const expenseCategoryData = [
  { name: "Rent", value: 50000, color: "#8b5cf6" },
  { name: "Salary", value: 240000, color: "#3b82f6" },
  { name: "Marketing", value: 35000, color: "#ec4899" },
  { name: "Utilities", value: 18000, color: "#f59e0b" },
  { name: "Maintenance", value: 22000, color: "#f97316" },
  { name: "Office", value: 12000, color: "#06b6d4" },
  { name: "Travel", value: 8000, color: "#84cc16" },
  { name: "Other", value: 15000, color: "#6b7280" },
];

export function ExpenseCategoryChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={expenseCategoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={110} dataKey="value" nameKey="name" label={({ name, value }) => `${name}: ${formatINRShort(value)}`} labelLine={false}>
          {expenseCategoryData.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

// ── Monthly Expense Trend Line Chart ───────────────────────────────────────
const monthlyExpenseData = [
  { month: "Oct", actual: 320000, budget: 350000 },
  { month: "Nov", actual: 380000, budget: 350000 },
  { month: "Dec", actual: 290000, budget: 350000 },
  { month: "Jan", actual: 410000, budget: 370000 },
  { month: "Feb", actual: 360000, budget: 370000 },
  { month: "Mar", actual: 400000, budget: 370000 },
];

export function MonthlyExpenseTrendChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={monthlyExpenseData}>
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
        <YAxis tickFormatter={formatINRShort} tick={{ fontSize: 12 }} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Line type="monotone" dataKey="actual" stroke="#ef4444" strokeWidth={2} name="Actual" dot={{ r: 4 }} />
        <Line type="monotone" dataKey="budget" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" name="Budget" dot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ── Report Charts ──────────────────────────────────────────────────────────
const reportRevenueData = [
  { date: "Mar 16", amount: 145000 },
  { date: "Mar 17", amount: 82000 },
  { date: "Mar 18", amount: 92000 },
  { date: "Mar 19", amount: 72000 },
  { date: "Mar 20", amount: 85000 },
];

export function ReportRevenueAreaChart() {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <AreaChart data={reportRevenueData}>
        <defs>
          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
        <YAxis tickFormatter={formatINRShort} tick={{ fontSize: 12 }} />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={2} fill="url(#revGrad)" name="Revenue" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function ReportSalesBarChart() {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={reportRevenueData}>
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
        <YAxis tickFormatter={formatINRShort} tick={{ fontSize: 12 }} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="amount" name="Sales" fill="#3b82f6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

const leadConversionData = [
  { stage: "Total Leads", count: 115 },
  { stage: "Contacted", count: 87 },
  { stage: "Interested", count: 52 },
  { stage: "Test Ride", count: 34 },
  { stage: "Converted", count: 18 },
];

export function ReportLeadFunnelChart() {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={leadConversionData} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis type="number" tick={{ fontSize: 12 }} />
        <YAxis dataKey="stage" type="category" width={90} tick={{ fontSize: 11 }} />
        <Tooltip content={<CustomTooltip prefix="" />} />
        <Bar dataKey="count" name="Leads" radius={[0, 4, 4, 0]} label={{ position: "right", fontSize: 11 }}>
          {leadConversionData.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

const inventoryData = [
  { model: "Activa 6G", Available: 12, Booked: 5, Sold: 18 },
  { model: "SP 125", Available: 8, Booked: 3, Sold: 14 },
  { model: "Shine", Available: 10, Booked: 4, Sold: 20 },
  { model: "CB350", Available: 5, Booked: 2, Sold: 8 },
  { model: "Dio", Available: 7, Booked: 6, Sold: 15 },
];

export function ReportInventoryChart() {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={inventoryData}>
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis dataKey="model" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />
        <Legend />
        <Bar dataKey="Available" stackId="a" fill="#10b981" />
        <Bar dataKey="Booked" stackId="a" fill="#f59e0b" />
        <Bar dataKey="Sold" stackId="a" fill="#3b82f6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Lead Source Donut ──────────────────────────────────────────────────────
const leadSourceData = [
  { name: "Walk-in", value: 30, color: "#3b82f6" },
  { name: "Online", value: 25, color: "#10b981" },
  { name: "Referral", value: 20, color: "#f59e0b" },
  { name: "Social Media", value: 15, color: "#8b5cf6" },
  { name: "Other", value: 10, color: "#6b7280" },
];

export function LeadSourceChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={leadSourceData} cx="50%" cy="50%" innerRadius={60} outerRadius={110} dataKey="value" nameKey="name" label={({ name, value }) => `${name}: ${value}%`} labelLine={false}>
          {leadSourceData.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip formatter={(value: any) => `${value}%`} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

// ── Lead Conversion Rate Gauge ─────────────────────────────────────────────
export function LeadConversionGauge() {
  const rate = 26.7;
  const data = [
    { name: "Converted", value: rate, color: "#10b981" },
    { name: "Remaining", value: 100 - rate, color: "#e5e7eb" },
  ];
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={80} outerRadius={110} startAngle={90} endAngle={-270} dataKey="value">
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <text x="50%" y="46%" textAnchor="middle" dominantBaseline="middle" className="fill-foreground text-3xl font-bold">{rate}%</text>
        <text x="50%" y="56%" textAnchor="middle" dominantBaseline="middle" className="fill-muted-foreground text-xs">Conversion Rate</text>
      </PieChart>
    </ResponsiveContainer>
  );
}

// ── CashFlow Stacked Bar Chart ─────────────────────────────────────────────
const cashFlowData = [
  { day: "Mon", inflow: 85000, outflow: 32000, net: 53000 },
  { day: "Tue", inflow: 120000, outflow: 45000, net: 75000 },
  { day: "Wed", inflow: 65000, outflow: 58000, net: 7000 },
  { day: "Thu", inflow: 195000, outflow: 28000, net: 167000 },
  { day: "Fri", inflow: 45000, outflow: 62000, net: -17000 },
  { day: "Sat", inflow: 230000, outflow: 15000, net: 215000 },
  { day: "Sun", inflow: 12000, outflow: 8000, net: 4000 },
];

export function CashFlowChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={cashFlowData}>
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis dataKey="day" tick={{ fontSize: 12 }} />
        <YAxis tickFormatter={formatINRShort} tick={{ fontSize: 12 }} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar dataKey="inflow" name="Inflow" fill="#10b981" radius={[4, 4, 0, 0]} />
        <Bar dataKey="outflow" name="Outflow" fill="#ef4444" radius={[4, 4, 0, 0]} />
        <Line type="monotone" dataKey="net" stroke="#3b82f6" strokeWidth={2} name="Net" />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Service Revenue Bar Chart ──────────────────────────────────────────────
const serviceRevenueData = [
  { day: "Mon", billed: 4500, received: 3200 },
  { day: "Tue", billed: 6800, received: 5500 },
  { day: "Wed", billed: 3200, received: 3200 },
  { day: "Thu", billed: 8900, received: 6000 },
  { day: "Fri", billed: 5600, received: 4200 },
  { day: "Sat", billed: 12000, received: 9500 },
  { day: "Sun", billed: 2100, received: 2100 },
];

export function ServiceRevenueChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={serviceRevenueData}>
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis dataKey="day" tick={{ fontSize: 12 }} />
        <YAxis tickFormatter={formatINRShort} tick={{ fontSize: 12 }} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar dataKey="billed" name="Total Billed" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        <Bar dataKey="received" name="Received" fill="#10b981" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Super Owner Charts ─────────────────────────────────────────────────────
const revenueByClientData = [
  { client: "Royal Riders", revenue: 567000 },
  { client: "Vaahan Motors", revenue: 456000 },
  { client: "Sharma Honda", revenue: 328000 },
  { client: "Speed Zone", revenue: 234000 },
  { client: "City Bikes", revenue: 112000 },
];

export function RevenueByClientChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={revenueByClientData} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis type="number" tickFormatter={formatINRShort} tick={{ fontSize: 12 }} />
        <YAxis dataKey="client" type="category" width={110} tick={{ fontSize: 11 }} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="revenue" name="Revenue" fill="#8b5cf6" radius={[0, 4, 4, 0]} label={{ position: "right", fontSize: 10, formatter: (v: any) => formatINRShort(v) }} />
      </BarChart>
    </ResponsiveContainer>
  );
}

const planDistData = [
  { name: "Free", value: 12, color: "#6b7280" },
  { name: "Starter", value: 24, color: "#3b82f6" },
  { name: "Professional", value: 18, color: "#10b981" },
  { name: "Enterprise", value: 6, color: "#8b5cf6" },
];

export function PlanDistributionChart() {
  const total = planDistData.reduce((s, d) => s + d.value, 0);
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={planDistData} cx="50%" cy="50%" innerRadius={60} outerRadius={110} dataKey="value" nameKey="name" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
          {planDistData.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <text x="50%" y="48%" textAnchor="middle" dominantBaseline="middle" className="fill-foreground text-2xl font-bold">{total}</text>
        <text x="50%" y="56%" textAnchor="middle" dominantBaseline="middle" className="fill-muted-foreground text-xs">Clients</text>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

const clientGrowthData = [
  { month: "Oct", clients: 3 },
  { month: "Nov", clients: 5 },
  { month: "Dec", clients: 4 },
  { month: "Jan", clients: 7 },
  { month: "Feb", clients: 6 },
  { month: "Mar", clients: 8 },
];

export function ClientGrowthChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={clientGrowthData}>
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip content={<CustomTooltip prefix="" />} />
        <Line type="monotone" dataKey="clients" stroke="#3b82f6" strokeWidth={2} dot={{ r: 5, fill: "#3b82f6" }} name="New Clients" />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ── Super Owner Revenue Trend (compact) ────────────────────────────────────
const superOwnerRevData = [
  { month: "Oct", revenue: 1200000 },
  { month: "Nov", revenue: 1450000 },
  { month: "Dec", revenue: 1680000 },
  { month: "Jan", revenue: 1520000 },
  { month: "Feb", revenue: 1750000 },
  { month: "Mar", revenue: 1845000 },
];

export function SuperOwnerRevenueTrendChart() {
  return (
    <ResponsiveContainer width="100%" height={120}>
      <AreaChart data={superOwnerRevData}>
        <defs>
          <linearGradient id="soRevGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="month" tick={{ fontSize: 10 }} />
        <YAxis hide />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fill="url(#soRevGrad)" name="Revenue" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
