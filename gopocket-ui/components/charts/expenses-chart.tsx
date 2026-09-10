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

const buildExpenseChart = ({
  expenses,
}: {
  expenses: DashboardExpense[];
}): ApexOptions => {
  const { amounts, categories } = expenses.reduce(
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
    series: amounts,
    labels: categories,
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
