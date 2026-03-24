"use client";

import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { BarChart3 } from "lucide-react";

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

// ── Empty State Placeholder ────────────────────────────────────────────────
function EmptyChart({ height = 250, message = "No data available yet" }: { height?: number; message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-muted-foreground" style={{ height }}>
      <BarChart3 className="h-10 w-10 mb-2 opacity-30" />
      <p className="text-sm">{message}</p>
      <p className="text-xs opacity-60">Data will appear here when available</p>
    </div>
  );
}

// ── Sales Trend Area Chart ─────────────────────────────────────────────────
export function SalesTrendChart({ data }: { data?: any[] }) {
  if (!data || data.length === 0) return <EmptyChart message="No sales data yet" />;
  return (
    <ResponsiveContainer width="100%" height={250}>
      <AreaChart data={data}>
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
export function LeadPipelineChart({ data }: { data?: any[] }) {
  if (!data || data.length === 0) return <EmptyChart message="No lead data yet" />;
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis dataKey="stage" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip content={<CustomTooltip prefix="" />} />
        <Bar dataKey="count" name="Leads" radius={[4, 4, 0, 0]} label={{ position: "top", fontSize: 11 }}>
          {data.map((entry: any, i: number) => (
            <Cell key={i} fill={entry.fill || COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Revenue by Month Bar Chart ─────────────────────────────────────────────
export function RevenueByMonthChart({ data }: { data?: any[] }) {
  if (!data || data.length === 0) return <EmptyChart height={300} message="No revenue data yet" />;
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
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
export function VehicleStatusChart({ data }: { data?: any[] }) {
  if (!data || data.length === 0) return <EmptyChart height={300} message="No vehicle data yet" />;
  const total = data.reduce((s: number, d: any) => s + d.value, 0);
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={70} outerRadius={110} dataKey="value" nameKey="name" label={({ name, value }: any) => `${name}: ${value}`} labelLine={false}>
          {data.map((entry: any, i: number) => (
            <Cell key={i} fill={entry.color || COLORS[i % COLORS.length]} />
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
export function TopSellingModelsChart({ data }: { data?: any[] }) {
  if (!data || data.length === 0) return <EmptyChart height={300} message="No sales data yet" />;
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis type="number" tick={{ fontSize: 12 }} />
        <YAxis dataKey="model" type="category" width={100} tick={{ fontSize: 11 }} />
        <Tooltip content={<CustomTooltip prefix="" />} />
        <Bar dataKey="units" name="Units Sold" fill="#10b981" radius={[0, 4, 4, 0]} label={{ position: "right", fontSize: 11 }} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Daily Sales Line Chart ─────────────────────────────────────────────────
export function DailySalesChart({ data }: { data?: any[] }) {
  if (!data || data.length === 0) return <EmptyChart height={300} message="No daily sales data" />;
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
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
export function SalesByPaymentModeChart({ data }: { data?: any[] }) {
  if (!data || data.length === 0) return <EmptyChart height={300} message="No payment data" />;
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" outerRadius={110} dataKey="value" nameKey="name" label={({ name, value }: any) => `${name}: ${value}%`}>
          {data.map((entry: any, i: number) => (
            <Cell key={i} fill={entry.color || COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value: any) => `${value}%`} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

// ── Expense Category Pie Chart ─────────────────────────────────────────────
export function ExpenseCategoryChart({ data }: { data?: any[] }) {
  if (!data || data.length === 0) return <EmptyChart height={300} message="No expense data" />;
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={110} dataKey="value" nameKey="name" label={({ name, value }: any) => `${name}: ${formatINRShort(value)}`} labelLine={false}>
          {data.map((entry: any, i: number) => (
            <Cell key={i} fill={entry.color || COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

// ── Monthly Expense Trend Line Chart ───────────────────────────────────────
export function MonthlyExpenseTrendChart({ data }: { data?: any[] }) {
  if (!data || data.length === 0) return <EmptyChart height={300} message="No expense trend data" />;
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
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
export function ReportRevenueAreaChart({ data }: { data?: any[] }) {
  if (!data || data.length === 0) return <EmptyChart message="No revenue data" />;
  return (
    <ResponsiveContainer width="100%" height={250}>
      <AreaChart data={data}>
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

export function ReportSalesBarChart({ data }: { data?: any[] }) {
  if (!data || data.length === 0) return <EmptyChart message="No sales data" />;
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
        <YAxis tickFormatter={formatINRShort} tick={{ fontSize: 12 }} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="amount" name="Sales" fill="#3b82f6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ReportLeadFunnelChart({ data }: { data?: any[] }) {
  if (!data || data.length === 0) return <EmptyChart message="No lead funnel data" />;
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis type="number" tick={{ fontSize: 12 }} />
        <YAxis dataKey="stage" type="category" width={90} tick={{ fontSize: 11 }} />
        <Tooltip content={<CustomTooltip prefix="" />} />
        <Bar dataKey="count" name="Leads" radius={[0, 4, 4, 0]} label={{ position: "right", fontSize: 11 }}>
          {data.map((_: any, i: number) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ReportInventoryChart({ data }: { data?: any[] }) {
  if (!data || data.length === 0) return <EmptyChart message="No inventory data" />;
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
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
export function LeadSourceChart({ data }: { data?: any[] }) {
  if (!data || data.length === 0) return <EmptyChart height={300} message="No lead source data" />;
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={110} dataKey="value" nameKey="name" label={({ name, value }: any) => `${name}: ${value}%`} labelLine={false}>
          {data.map((entry: any, i: number) => (
            <Cell key={i} fill={entry.color || COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value: any) => `${value}%`} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

// ── Lead Conversion Rate Gauge ─────────────────────────────────────────────
export function LeadConversionGauge({ rate = 0 }: { rate?: number }) {
  const d = [
    { name: "Converted", value: rate, color: "#10b981" },
    { name: "Remaining", value: 100 - rate, color: "#e5e7eb" },
  ];
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={d} cx="50%" cy="50%" innerRadius={80} outerRadius={110} startAngle={90} endAngle={-270} dataKey="value">
          {d.map((entry, i) => (
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
export function CashFlowChart({ data }: { data?: any[] }) {
  if (!data || data.length === 0) return <EmptyChart height={300} message="No cashflow data" />;
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis dataKey="day" tick={{ fontSize: 12 }} />
        <YAxis tickFormatter={formatINRShort} tick={{ fontSize: 12 }} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar dataKey="inflow" name="Inflow" fill="#10b981" radius={[4, 4, 0, 0]} />
        <Bar dataKey="outflow" name="Outflow" fill="#ef4444" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Service Revenue Bar Chart ──────────────────────────────────────────────
export function ServiceRevenueChart({ data }: { data?: any[] }) {
  if (!data || data.length === 0) return <EmptyChart height={300} message="No service data" />;
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
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
export function RevenueByClientChart({ data }: { data?: any[] }) {
  if (!data || data.length === 0) return <EmptyChart height={300} message="No client revenue data" />;
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis type="number" tickFormatter={formatINRShort} tick={{ fontSize: 12 }} />
        <YAxis dataKey="client" type="category" width={110} tick={{ fontSize: 11 }} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="revenue" name="Revenue" fill="#8b5cf6" radius={[0, 4, 4, 0]} label={{ position: "right", fontSize: 10, formatter: (v: any) => formatINRShort(v) }} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function PlanDistributionChart({ data }: { data?: any[] }) {
  if (!data || data.length === 0) return <EmptyChart height={300} message="No plan data" />;
  const total = data.reduce((s: number, d: any) => s + d.value, 0);
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={110} dataKey="value" nameKey="name" label={({ name, value }: any) => `${name}: ${value}`} labelLine={false}>
          {data.map((entry: any, i: number) => (
            <Cell key={i} fill={entry.color || COLORS[i % COLORS.length]} />
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

export function ClientGrowthChart({ data }: { data?: any[] }) {
  if (!data || data.length === 0) return <EmptyChart height={300} message="No growth data" />;
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip content={<CustomTooltip prefix="" />} />
        <Line type="monotone" dataKey="clients" stroke="#3b82f6" strokeWidth={2} dot={{ r: 5, fill: "#3b82f6" }} name="New Clients" />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function SuperOwnerRevenueTrendChart({ data }: { data?: any[] }) {
  if (!data || data.length === 0) return <EmptyChart height={120} message="No data" />;
  return (
    <ResponsiveContainer width="100%" height={120}>
      <AreaChart data={data}>
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
