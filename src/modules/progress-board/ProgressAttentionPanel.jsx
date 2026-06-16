import { ATTENTION_LABELS, labelOfProgressStatus } from "../../data/progressLabels";
import {
  getOverdueControls,
  getStaleNotStartedControls
} from "./attentionItemsUtils";

function statusClass(status) {
  return String(status || "").replaceAll("_", "-");
}

export function ProgressAttentionPanel({
  controls,
  taskMap,
  projectStartDate = "",
  selectedId,
  onSelect
}) {
  const overdueItems = getOverdueControls(controls, taskMap);
  const staleItems = getStaleNotStartedControls(controls, taskMap, projectStartDate);

  if (!overdueItems.length && !staleItems.length) {
    return null;
  }

  return (
    <section className="progress-attention-panel" aria-label={ATTENTION_LABELS.panelTitle}>
      <header className="attention-panel-head">
        <h3>{ATTENTION_LABELS.panelTitle}</h3>
        <p className="panel-note">{ATTENTION_LABELS.panelLead}</p>
      </header>

      {overdueItems.length ? (
        <div className="attention-section">
          <h4>{ATTENTION_LABELS.overdueTitle}（{overdueItems.length}）</h4>
          <ul className="attention-overdue-list">
            {overdueItems.map(({ control, task, overdueDays }) => (
              <li key={control.id}>
                <button
                  type="button"
                  className={`attention-overdue-item ${selectedId === control.id ? "active" : ""}`}
                  onClick={() => onSelect(control.id)}
                >
                  <div>
                    <strong>{control.title}</strong>
                    <small> · {control.id}</small>
                    <p>
                      {ATTENTION_LABELS.dueLabel}：{task?.due || "—"}
                      {overdueDays ? ` · ${ATTENTION_LABELS.overdueDaysPrefix}${overdueDays} 天` : ""}
                      {control.owner ? ` · ${control.owner}` : ""}
                    </p>
                  </div>
                  <span className={`progress-pill compact ${statusClass(control.progressStatus)}`}>
                    {labelOfProgressStatus(control.progressStatus)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {staleItems.length ? (
        <div className="attention-section">
          <h4>{ATTENTION_LABELS.staleTitle}（{staleItems.length}）</h4>
          <ul className="attention-overdue-list">
            {staleItems.map(({ control, task, reason }) => (
              <li key={control.id}>
                <button
                  type="button"
                  className={`attention-overdue-item stale ${selectedId === control.id ? "active" : ""}`}
                  onClick={() => onSelect(control.id)}
                >
                  <div>
                    <strong>{control.title}</strong>
                    <small> · {control.id}</small>
                    <p>
                      {reason}
                      {task?.due ? ` · ${ATTENTION_LABELS.dueLabel}：${task.due}` : ""}
                      {control.owner ? ` · ${control.owner}` : ""}
                    </p>
                  </div>
                  <span className={`progress-pill compact ${statusClass(control.progressStatus)}`}>
                    {labelOfProgressStatus(control.progressStatus)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
