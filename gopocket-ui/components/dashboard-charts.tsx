"use client";

import { useEffect, useRef } from "react";
import type { ApexOptions } from "apexcharts";

interface DashboardChartsProps {
  trend: Array<{ label: string; balance: number }>;
  expenses: Array<{ category: string; amount: number }>;
}

export function DashboardCharts({ trend, expenses }: DashboardChartsProps) {
  const trendRef = useRef<HTMLDivElement>(null);
  const expenseRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let trendChart: { destroy: () => void } | undefined;
    let expenseChart: { destroy: () => void } | undefined;

    void import("apexcharts").then(({ default: ApexCharts }) => {
      if (!trendRef.current || !expenseRef.current) return;

      const chartTheme = { mode: document.documentElement.dataset.theme === "dark" ? "dark" as const : "light" as const };
      const trendOptions: ApexOptions = {
        chart: { type: "area", height: 300, toolbar: { show: false }, zoom: { enabled: false } },
        theme: chartTheme,
        colors: ["#09BC8A"],
        stroke: { curve: "smooth", width: 3 },
        fill: { type: "gradient", gradient: { opacityFrom: 0.35, opacityTo: 0.03 } },
        dataLabels: { enabled: false },
        xaxis: { categories: trend.map((point) => point.label), labels: { rotate: -45 } },
        yaxis: { labels: { formatter: (value) => `$${(value / 100).toFixed(0)}` } },
        tooltip: { y: { formatter: (value) => `$${(value / 100).toFixed(2)}` } },
        series: [{ name: "Balance", data: trend.map((point) => point.balance) }],
      };
      const expenseOptions: ApexOptions = {
        chart: { type: "donut", height: 300 },
        theme: chartTheme,
        labels: expenses.map((item) => item.category),
        colors: ["#C3423F", "#2D82B7", "#F2A541", "#6B9080", "#8E7DBE"],
        legend: { position: "bottom" },
        dataLabels: { enabled: false },
        tooltip: { y: { formatter: (value) => `$${(value / 100).toFixed(2)}` } },
        series: expenses.map((item) => item.amount),
      };

      trendChart = new ApexCharts(trendRef.current, trendOptions);
      expenseChart = new ApexCharts(expenseRef.current, expenseOptions);
      void trendChart.render();
      void expenseChart.render();
    });

    return () => {
      trendChart?.destroy();
      expenseChart?.destroy();
    };
  }, [expenses, trend]);

  return (
    <>
      <div ref={trendRef} />
      <div ref={expenseRef} />
    </>
  );
}
