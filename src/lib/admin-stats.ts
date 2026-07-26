import { prisma } from "@/lib/prisma";

// 1. Top Section Cards Data (7 Days Trend)
export async function getAdminDashboardStats() {
  const now = new Date();
  const past7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(now.getDate() - (6 - i));
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const [orders, users, totalIncomeAgg] = await Promise.all([
    prisma.order.findMany({
      where: { createdAt: { gte: past7Days[0] } },
      select: { totalPrice: true, createdAt: true },
    }),
    prisma.user.findMany({
      where: { createdAt: { gte: past7Days[0] } },
      select: { createdAt: true },
    }),
    prisma.order.aggregate({
      _sum: { totalPrice: true },
    }),
  ]);

  const totalIncome = totalIncomeAgg._sum.totalPrice || 0;
  const totalOrdersCount = await prisma.order.count();
  const totalUsersCount = await prisma.user.count();

  const incomeTrend = past7Days.map((date) => {
    const nextDate = new Date(date);
    nextDate.setDate(date.getDate() + 1);
    const dayIncome = orders
      .filter((o) => o.createdAt >= date && o.createdAt < nextDate)
      .reduce((acc, curr) => acc + curr.totalPrice, 0);
    return { value: dayIncome };
  });

  const usersTrend = past7Days.map((date) => {
    const nextDate = new Date(date);
    nextDate.setDate(date.getDate() + 1);
    const dayUsers = users.filter((u) => u.createdAt >= date && u.createdAt < nextDate).length;
    return { value: dayUsers };
  });

  const ordersTrend = past7Days.map((date) => {
    const nextDate = new Date(date);
    nextDate.setDate(date.getDate() + 1);
    const dayOrders = orders.filter((o) => o.createdAt >= date && o.createdAt < nextDate).length;
    return { value: dayOrders };
  });

  const calcChange = (trendArr: { value: number }[]) => {
    const today = trendArr[6].value;
    const yesterday = trendArr[5].value;

    let percentage = 0;
    if (yesterday > 0) {
      percentage = ((today - yesterday) / yesterday) * 100;
    } else if (today > 0) {
      percentage = 100;
    }

    const isPositive = today >= yesterday;

    return {
      percentage: `${percentage >= 0 ? "+" : ""}${percentage.toFixed(1)}%`,
      isPositive,
    };
  };

  const incomeCalc = calcChange(incomeTrend);
  const usersCalc = calcChange(usersTrend);
  const ordersCalc = calcChange(ordersTrend);

  return {
    income: {
      total: `৳${totalIncome.toLocaleString("bn-BD")}`,
      change: incomeCalc.percentage,
      isPositive: incomeCalc.isPositive,
      chartData: incomeTrend,
    },
    customers: {
      total: totalUsersCount.toLocaleString(),
      change: usersCalc.percentage,
      isPositive: usersCalc.isPositive,
      chartData: usersTrend,
    },
    orders: {
      total: totalOrdersCount.toLocaleString(),
      change: ordersCalc.percentage,
      isPositive: ordersCalc.isPositive,
      chartData: ordersTrend,
    },
    activeAccounts: {
      total: totalUsersCount.toLocaleString(),
      change: "+100%",
      isPositive: true,
      chartData: usersTrend,
    },
  };
}

// 2. Main Interactive Chart Data (Last 90 Days Total Income & Total Orders)
export async function getInteractiveChartData() {
  const today = new Date();
  const past90Days = new Date();
  past90Days.setDate(today.getDate() - 90);
  past90Days.setHours(0, 0, 0, 0);

  const orders = await prisma.order.findMany({
    where: {
      createdAt: {
        gte: past90Days,
        lte: today,
      },
    },
    select: {
      createdAt: true,
      totalPrice: true,
    },
  });

  const dateMap: { [key: string]: { orders: number; income: number } } = {};

  for (let i = 89; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    dateMap[dateStr] = { orders: 0, income: 0 };
  }

  orders.forEach((order) => {
    const dateStr = order.createdAt.toISOString().split("T")[0];
    if (dateMap[dateStr]) {
      dateMap[dateStr].orders += 1;
      dateMap[dateStr].income += order.totalPrice;
    }
  });

  return Object.keys(dateMap).map((date) => ({
    date,
    orders: dateMap[date].orders,
    income: dateMap[date].income,
  }));
}