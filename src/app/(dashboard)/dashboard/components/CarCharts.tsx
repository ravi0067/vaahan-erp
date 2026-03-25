"use client";

import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
  TooltipProps,
} from "recharts";
import { ValueType, NameType } from "recharts/types/component/DefaultTooltipContent";

// ── Color Palettes ──────────────────────────────────────────────────────────
const BLUE_PALETTE = ["#1d4ed8", "#2563eb", "#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe"];
const FUEL_COLORS: Record<string, string> = {
  Petrol: "#f59e0b",
  Diesel: "#1d4ed8",
  CNG: "#10b981",
  Electric: "#8b5cf6",
  Hybrid: "#06b6d4",
};
const BODY_COLORS: Record<string, string> = {
  SUV: "#1d4ed8",
  Sedan: "#2563eb",
  Hatchback: "#3b82f6",
  MPV: "#60a5fa",
  Coupe: "#93c5fd",
  Other: "#bfdbfe",
};

// ── Formatters ──────────────────────────────────────────────────────────────
const formatINR = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

const formatINRShort = (value: number) => {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`;
  return `₹${value}`;
};

// ── Custom Tooltip ──────────────────────────────────────────────────────────
function CarTooltip({
  active,
  payload,
  label,
  isCurrency = true,
}: TooltipProps<ValueType, NameType> & { isCurrency?: boolean }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border rounded-lg shadow-lg p-3 text-sm">
        {label && <p className="font-medium mb-1">{label}</p>}
        {payload.map((entry, i) => (
          <p key={i} style={{ color: entry.color as string }}>
            {entry.name}:{" "}
            {isCurrency
              ? formatINR(Number(entry.value))
              : String(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

// ── Mock Data ───────────────────────────────────────────────────────────────
const bodyTypeSalesData = [
  { name: "SUV", value: 42 },
  { name: "Sedan", value: 28 },
  { name: "Hatchback", value: 35 },
  { name: "MPV", value: 15 },
  { name: "Coupe", value: 8 },
  { name: "Other", value: 5 },
];

const fuelTypeData = [
  { name: "Petrol", value: 38 },
  { name: "Diesel", value: 32 },
  { name: "CNG", value: 12 },
  { name: "Electric", value: 10 },
  { name: "Hybrid", value: 8 },
];

const carRevenueTrendData = [
  { month: "Oct", revenue: 4800000, target: 5000000 },
  { month: "Nov", revenue: 5600000, target: 5200000 },
  { month: "Dec", revenue: 7200000, target: 6000000 },
  { month: "Jan", revenue: 6400000, target: 6500000 },
  { month: "Feb", revenue: 8100000, target: 7000000 },
  { month: "Mar", revenue: 7600000, target: 7500000 },
];

const topSellingCarsData = [
  { model: "Hyundai Creta", units: 22 },
  { model: "Tata Nexon", units: 19 },
  { model: "Maruti Swift", units: 18 },
  { model: "Kia Seltos", units: 15 },
  { model: "Mahindra XUV700", units: 12 },
  { model: "Tata Punch EV", units: 10 },
];

const financeVsCashData = [
  { month: "Oct", Finance: 2800000, Cash: 2000000 },
  { month: "Nov", Finance: 3200000, Cash: 2400000 },
  { month: "Dec", Finance: 4100000, Cash: 3100000 },
  { month: "Jan", Finance: 3600000, Cash: 2800000 },
  { month: "Feb", Finance: 4800000, Cash: 3300000 },
  { month: "Mar", Finance: 4200000, Cash: 3400000 },
];

const testDriveConversionData = [
  { stage: "Leads", count: 120 },
  { stage: "Test Drives", count: 74 },
  { stage: "Follow-up", count: 52 },
  { stage: "Bookings", count: 31 },
  { stage: "Deliveries", count: 24 },
];

// ── Chart Components ─────────────────────────────────────────────────────────

export function BodyTypeSalesChart() {
  if (bodyTypeSalesData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[260px] text-muted-foreground text-sm">
        No data available
      </div>
    );
  }
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={bodyTypeSalesData}
          cx="50%"
          cy="50%"
          innerRadius={65}
          outerRadius={100}
          dataKey="value"
          nameKey="name"
          label={({ name, value }: { name: string; value: number }) =>
            `${name}: ${value}`
          }
          labelLine={false}
        >
          {bodyTypeSalesData.map((entry) => (
            <Cell
              key={entry.name}
              fill={BODY_COLORS[entry.name] ?? BLUE_PALETTE[0]}
            />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: ValueType) => [`${value} units`, "Sales"]}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function FuelTypeDistributionChart() {
  if (fuelTypeData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[260px] text-muted-foreground text-sm">
        No data available
      </div>
    );
  }
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={fuelTypeData}
          cx="50%"
          cy="50%"
          outerRadius={100}
          dataKey="value"
          nameKey="name"
          label={({ name, value }: { name: string; value: number }) =>
            `${name}: ${value}%`
          }
          labelLine={false}
        >
          {fuelTypeData.map((entry) => (
            <Cell
              key={entry.name}
              fill={FUEL_COLORS[entry.name] ?? BLUE_PALETTE[0]}
            />
          ))}
        </Pie>
        <Tooltip formatter={(value: ValueType) => [`${value}%`, "Share"]} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function CarRevenueTrendChart() {
  if (carRevenueTrendData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[280px] text-muted-foreground text-sm">
        No data available
      </div>
    );
  }
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={carRevenueTrendData}>
        <defs>
          <linearGradient id="carRevGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="carTargetGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
        <YAxis tickFormatter={formatINRShort} tick={{ fontSize: 12 }} />
        <Tooltip content={<CarTooltip isCurrency />} />
        <Legend />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="#2563eb"
          strokeWidth={2}
          fill="url(#carRevGrad)"
          name="Revenue"
        />
        <Area
          type="monotone"
          dataKey="target"
          stroke="#10b981"
          strokeWidth={2}
          strokeDasharray="5 5"
          fill="url(#carTargetGrad)"
          name="Target"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function TopSellingCarsChart() {
  if (topSellingCarsData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[280px] text-muted-foreground text-sm">
        No data available
      </div>
    );
  }
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={topSellingCarsData} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis type="number" tick={{ fontSize: 12 }} />
        <YAxis
          dataKey="model"
          type="category"
          width={120}
          tick={{ fontSize: 11 }}
        />
        <Tooltip content={<CarTooltip isCurrency={false} />} />
        <Bar
          dataKey="units"
          name="Units Sold"
          radius={[0, 4, 4, 0]}
          label={{ position: "right" as const, fontSize: 11 }}
        >
          {topSellingCarsData.map((entry, i) => (
            <Cell key={entry.model} fill={BLUE_PALETTE[i % BLUE_PALETTE.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function FinanceVsCashChart() {
  if (financeVsCashData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[280px] text-muted-foreground text-sm">
        No data available
      </div>
    );
  }
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={financeVsCashData}>
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
        <YAxis tickFormatter={formatINRShort} tick={{ fontSize: 12 }} />
        <Tooltip content={<CarTooltip isCurrency />} />
        <Legend />
        <Bar
          dataKey="Finance"
          stackId="a"
          fill="#2563eb"
          name="Finance"
        />
        <Bar
          dataKey="Cash"
          stackId="a"
          fill="#10b981"
          name="Cash"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function TestDriveConversionChart() {
  if (testDriveConversionData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[260px] text-muted-foreground text-sm">
        No data available
      </div>
    );
  }
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={testDriveConversionData} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis type="number" tick={{ fontSize: 12 }} />
        <YAxis
          dataKey="stage"
          type="category"
          width={90}
          tick={{ fontSize: 11 }}
        />
        <Tooltip content={<CarTooltip isCurrency={false} />} />
        <Bar
          dataKey="count"
          name="Count"
          radius={[0, 4, 4, 0]}
          label={{ position: "right" as const, fontSize: 11 }}
        >
          {testDriveConversionData.map((entry, i) => (
            <Cell
              key={entry.stage}
              fill={BLUE_PALETTE[i % BLUE_PALETTE.length]}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
