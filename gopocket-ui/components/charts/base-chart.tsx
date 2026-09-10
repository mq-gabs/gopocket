import { makeVoidThrottle } from "@/utils/functions";
import ApexCharts, { ApexOptions } from "apexcharts";
import { useEffect, useRef } from "react";

interface IBaseChart {
  options: ApexOptions;
}

export default function BaseChart({ options }: IBaseChart) {
  const ref = useRef<HTMLDivElement>(null);
  const throttleRender = makeVoidThrottle({ timeoutMs: 1000 });

  useEffect(() => {
    throttleRender(() => {
      if (!ref.current) return;
      let apex: ApexCharts;

      import("apexcharts").then(({ default: ApexCharts }) => {
        if (!ref.current) return;

        apex = new ApexCharts(ref.current, options);

        apex.render();
      });
    });
  }, [ref, options]);

  return <div ref={ref} />;
}
