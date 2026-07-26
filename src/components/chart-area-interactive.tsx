"use client"

import * as React from "react"
import {
  ComposedChart,
  Bar,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"

export interface ChartDataItem {
  date: string;
  orders: number;
  income: number;
}

export function ChartAreaInteractive({ chartData = [] }: { chartData?: ChartDataItem[] }) {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("90d")

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d")
    }
  }, [isMobile])

  // টাইমফিল্টারিং লজিক
  const filteredData = React.useMemo(() => {
    if (!chartData || chartData.length === 0) return [];

    const latestDate = new Date(chartData[chartData.length - 1]?.date || new Date());
    let daysToSubtract = 90;
    if (timeRange === "30d") daysToSubtract = 30;
    if (timeRange === "7d") daysToSubtract = 7;

    const startDate = new Date(latestDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);

    return chartData.filter((item) => new Date(item.date) >= startDate);
  }, [chartData, timeRange]);

  return (
    <Card className="@container/card w-full border border-border/50 bg-card text-card-foreground ">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-lg font-bold">Payment & Order Statistics</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Daily orders and total income breakdown
          </CardDescription>
        </div>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={(v) => v && setTimeRange(v)}
            variant="outline"
            className="hidden @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d" className="text-xs">Last 3 months</ToggleGroupItem>
            <ToggleGroupItem value="30d" className="text-xs">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="7d" className="text-xs">Last 7 days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32 text-xs @[767px]/card:hidden" size="sm">
              <SelectValue placeholder="Select Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="90d">Last 3 months</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>

      <CardContent className="px-2 pt-2 sm:px-6">
        <div className="h-[360px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={filteredData} margin={{ top: 15, right: 10, left: -10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />

              {/* 💡 X-Axis Rotated Date (height={60} দিয়ে নিচের জন্য ফিক্সড স্পেস রাখা হয়েছে) */}
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                angle={-40}
                textAnchor="end"
                height={60} 
                tick={{ fontSize: 11, fill: "currentColor" }}
                className="text-muted-foreground opacity-80"
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });
                }}
              />

              {/* 💡 Left Y-Axis: Orders */}
              <YAxis
                yAxisId="left"
                orientation="left"
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
                tick={{ fontSize: 11, fill: "currentColor" }}
                className="text-muted-foreground opacity-80"
                label={{ value: 'Orders', angle: -90, position: 'insideLeft', offset: 15, style: { textAnchor: 'middle', fill: 'gray', fontSize: 10 } }}
              />

              {/* 💡 Right Y-Axis: Income (৳) */}
              <YAxis
                yAxisId="right"
                orientation="right"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "currentColor" }}
                className="text-muted-foreground opacity-80"
                tickFormatter={(val) => `৳${val}`}
                label={{ value: 'Income', angle: 90, position: 'insideRight', offset: 15, style: { textAnchor: 'middle', fill: 'gray', fontSize: 10 } }}
              />

              {/* 💡 Dynamic Tooltip */}
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--background, #0f172a)",
                  borderColor: "var(--border, rgba(255, 255, 255, 0.1))",
                  borderRadius: "8px",
                  color: "var(--foreground, #fff)",
                  fontSize: "12px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)"
                }}
                labelFormatter={(val) =>
                  new Date(val).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })
                }
                formatter={(value: any, name: any) => [
                  name === "income" ? `৳${Number(value).toLocaleString()}` : value,
                  name === "income" ? "Total Income" : "Total Orders",
                ]}
              />

              {/* 💡 Bottom Legend (wrapperStyle দিয়ে তারিখের নিচে গ্যাপ তৈরি করা হয়েছে) */}
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                wrapperStyle={{ paddingTop: "15px" }}
                formatter={(value) => (
                  <span className="text-xs font-medium text-muted-foreground capitalize mx-2">
                    {value === "income" ? "Income (৳)" : "Total Orders"}
                  </span>
                )}
              />

              {/* 1. Income (Green Bar) */}
              <Bar
                yAxisId="right"
                dataKey="income"
                name="income"
                fill="#22c55e"
                radius={[4, 4, 0, 0]}
                maxBarSize={24}
              />

              {/* 2. Total Orders (Blue Line) */}
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="orders"
                name="orders"
                stroke="#3b82f6"
                strokeWidth={2.5}
                dot={{ r: 3, fill: "#3b82f6" }}
                activeDot={{ r: 5 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}