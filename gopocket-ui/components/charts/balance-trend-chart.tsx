"use client";

import { useI18n } from "@/contexts/i18n-context";
import { Locale } from "@/locales";
import { DashboardTrend } from "@/types/models";
import { formatCurrentyScale } from "@/utils/currency";
import { formatDate } from "@/utils/time";
import { ApexOptions } from "apexcharts";
import { useMemo } from "react";
import BaseChart from "./base-chart";

type SplittedTrend = { balances: number[]; labels: string[] };

const buildTrendChartOptions = ({
  trends,
  locale,
}: {
  trends: DashboardTrend[];
  locale: Locale;
}): ApexOptions => {
  const { balances, labels } = trends.reduce(
    (acc, curr) => {
      return {
        balances: [...acc.balances, formatCurrentyScale(curr.balance)],
        labels: [...acc.labels, formatDate(new Date(curr.label), locale)],
      };
    },
    { balances: [], labels: [] } as SplittedTrend,
  );

  return {
    chart: {
      type: "line",
    },

    series: [
      {
        name: "Trend",
        data: balances,
      },
    ],
    xaxis: {
      categories: labels,
    },
  };
};

interface IBalanceTrend {
  trends?: DashboardTrend[];
}

export default function BalanceTrend({ trends }: IBalanceTrend) {
  if (!trends) return <></>;

  const { locale } = useI18n();
  const options = useMemo(
    () => buildTrendChartOptions({ trends, locale }),
    [trends],
  );

  return (
    <div>
      <BaseChart options={options} />
    </div>
  );
}
