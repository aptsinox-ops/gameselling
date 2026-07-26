"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUpIcon, TrendingDownIcon } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, YAxis } from "recharts";

interface MetricCardProps {
  title: string;
  value: string | number;
  change: string;
  isPositive: boolean;
  chartData: { value: number }[];
}

const toEnglishDigits = (val: string | number) => {
  if (val === null || val === undefined) return "";
  const bnToEnMap: Record<string, string> = {
    '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
    '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
  };
  return String(val).replace(/[০-৯]/g, (char) => bnToEnMap[char]);
};

const MetricCard = ({ title, value, change, isPositive, chartData }: MetricCardProps) => {
  const gradientId = `gradient-${title.replace(/\s+/g, "-").toLowerCase()}`;
  const chartColorClass = isPositive ? "text-primary" : "text-rose-500";

  const maxVal = Math.max(...chartData.map((d) => d.value), 0);
  const isZero = maxVal === 0;

  return (
    <Card className="relative overflow-hidden h-40 border-neutral-200 dark:border-neutral-800 shadow-none bg-card">
      {/* Background Graph */}
      <div className="absolute inset-0 z-0 opacity-100 pointer-events-none">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart 
            data={chartData} 
            margin={{ top: 20, right: 0, bottom: 0, left: 0 }}
          >
            <YAxis hide domain={[0, isZero ? 5 : maxVal * 1.2]} />
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop 
                  offset="0%" 
                  className={chartColorClass} 
                  stopColor="currentColor" 
                  stopOpacity={isZero ? 0.05 : 0.25} 
                />
                <stop 
                  offset="100%" 
                  className={chartColorClass} 
                  stopColor="currentColor" 
                  stopOpacity={0.0} 
                />
              </linearGradient>
            </defs>

            <Area 
              type="monotone" 
              dataKey="value" 
              className={chartColorClass} 
              stroke="currentColor"    
              strokeWidth={2}         
              fill={`url(#${gradientId})`} 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Content */}
      <CardHeader className="relative z-10 p-5"> 
        <div className="flex justify-between items-start">
          <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{title}</p>
          <Badge 
            variant="outline" 
            className={
              isPositive 
                ? "text-emerald-500 border-emerald-500/30 bg-emerald-500/10" 
                : "text-rose-500 border-rose-500/30 bg-rose-500/10"
            }
          >
            {isPositive ? <TrendingUpIcon className="mr-1 size-3" /> : <TrendingDownIcon className="mr-1 size-3" />}
            {toEnglishDigits(change)}
          </Badge>
        </div>
        <CardTitle className="text-3xl font-bold tabular-nums mt-1 text-foreground">
          {toEnglishDigits(value)}
        </CardTitle>
      </CardHeader>
    </Card>
  );
};

export function SectionCards({ stats }: { stats: any }) {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {/* 1. Total Income */}
      <MetricCard 
        title="Total Income" 
        value={stats.income.total} 
        change={stats.income.change} 
        isPositive={stats.income.isPositive} 
        chartData={stats.income.chartData} 
      />

      {/* 2. New Customers */}
      <MetricCard 
        title="New Customers" 
        value={stats.customers.total} 
        change={stats.customers.change} 
        isPositive={stats.customers.isPositive} 
        chartData={stats.customers.chartData} 
      />

      {/* 3. Total Order */}
      <MetricCard 
        title="Total Order" 
        value={stats.orders.total} 
        change={stats.orders.change} 
        isPositive={stats.orders.isPositive} 
        chartData={stats.orders.chartData} 
      />

      {/* 4. Active Accounts */}
      <MetricCard 
        title="Active Accounts" 
        value={stats.activeAccounts.total} 
        change={stats.activeAccounts.change} 
        isPositive={true} 
        chartData={stats.activeAccounts.chartData} 
      />
    </div>
  );
}