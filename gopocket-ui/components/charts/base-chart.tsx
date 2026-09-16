"use client";

import ApexCharts, { ApexOptions } from "apexcharts";
import { useEffect, useRef } from "react";

interface IBaseChart {
  options: ApexOptions;
}

const noInteractionDefaults: ApexOptions["chart"] = {
  toolbar: { show: false },
  zoom: { enabled: false },
  selection: { enabled: false },
};

export default function BaseChart({ options }: IBaseChart) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const chart = new ApexCharts(ref.current, {
      ...options,
      chart: {
        ...options.chart,
        ...noInteractionDefaults,
      },
    });

    chart.render();

    return () => {
      chart.destroy();
    };
  }, [options]);

  return <div ref={ref} />;
}
