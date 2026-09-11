"use client";

import ApexCharts, { ApexOptions } from "apexcharts";
import { useEffect, useRef } from "react";

interface IBaseChart {
  options: ApexOptions;
}
export default function BaseChart({ options }: IBaseChart) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let apex: ApexCharts;

    import("apexcharts").then(({ default: ApexCharts }) => {
      if (!ref.current) return;

      apex = new ApexCharts(ref.current, options);

      apex.render();
    });

    return () => apex?.destroy();
  }, [ref, options]);

  return <div ref={ref} />;
}
