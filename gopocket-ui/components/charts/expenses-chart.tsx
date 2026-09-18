"use client";

import { DashboardExpense } from "@/types/models";
import BaseChart from "./base-chart";
import { ApexOptions } from "apexcharts";
import { useMemo } from "react";
import { formatCurrentyScale } from "@/utils/currency";

type SplittedExpenses = {
  categories: string[];
  amounts: number[];
};

const prefixCurrency = (val: string | number) => `$ ${val}`;

const orderByAmount = (expenses: DashboardExpense[]) =>
  expenses.sort((a, b) => b.amount - a.amount);

const buildExpenseChart = ({
  expenses,
}: {
  expenses: DashboardExpense[];
}): ApexOptions => {
  const orderedExpenses = orderByAmount(expenses);

  const { amounts, categories } = orderedExpenses.reduce(
    (acc, curr) => {
      return {
        amounts: [...acc.amounts, formatCurrentyScale(curr.amount)],
        categories: [...acc.categories, curr.category],
      };
    },
    { amounts: [], categories: [] } as SplittedExpenses,
  );

  return {
    chart: {
      type: "donut",
    },
    plotOptions: {
      pie: {
        borderRadius: 12,
      },
    },
    stroke: {
      width: 0,
    },
    series: amounts,
    labels: categories,
    yaxis: {
      labels: {
        formatter: prefixCurrency,
      },
    },
  };
};

interface IExpenseChart {
  expenses: DashboardExpense[];
}
export default function ExpenseChart({ expenses }: IExpenseChart) {
  const options = useMemo(() => buildExpenseChart({ expenses }), [expenses]);
  return (
    <div>
      <BaseChart options={options} />
    </div>
  );
}
