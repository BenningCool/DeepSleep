import { useState } from "react";
import { METRICS_LEGEND } from "./managementCopy";

export function CommandMetricsLegend() {
  const [open, setOpen] = useState(false);

  return (
    <section className="command-metrics-legend">
      <button
        className="command-metrics-toggle"
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? "▾" : "▸"} 指标说明
      </button>
      {open ? (
        <ul className="command-metrics-list">
          {METRICS_LEGEND.map((item) => (
            <li key={item.title}>
              <strong>{item.title}</strong>
              <span>{item.body}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
