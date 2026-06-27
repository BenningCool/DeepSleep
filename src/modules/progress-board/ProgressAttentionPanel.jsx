import { ATTENTION_LABELS, labelOfWorkspaceStatus } from "../../data/progressLabels";
import { ProgressModuleHeading } from "./ProgressModuleHeading";
import { ProgressOwnerLabel } from "./ProgressOwnerLabel";
import {
  getOverdueControls,
  getStaleNotStartedControls
} from "./attentionItemsUtils";
import { countControlsWithPlanDue, resolveControlPlanDue } from "./progressDueUtils";
import { workspaceStatusClass } from "./progressVisualTokens";

export function ProgressAttentionPanel({
  controls,
  taskMap,
  projectStartDate = "",
  selectedId,
  onSelect
}) {
  const overdueItems = getOverdueControls(controls, taskMap);
  const staleItems = getStaleNotStartedControls(controls, taskMap, projectStartDate);
  const dueReadyCount = countControlsWithPlanDue(controls, taskMap);

  if (!overdueItems.length && !staleItems.length && !(controls.length && !dueReadyCount)) {
    return null;
  }

  return (
    <section
      className={`progress-attention-panel ${overdueItems.length ? "has-overdue" : ""}`}
      aria-label={ATTENTION_LABELS.panelTitle}
    >
      <header className="attention-panel-head">
        <ProgressModuleHeading
          title={ATTENTION_LABELS.panelTitle}
          titleEn={ATTENTION_LABELS.panelTitleEn}
        />
        <p className="panel-note">{ATTENTION_LABELS.panelLead}</p>
      </header>

      {controls.length && !dueReadyCount ? (
        <div className="attention-section attention-section-awaiting-data">
          <ProgressModuleHeading
            as="h4"
            className="attention-section-title stale"
            title={ATTENTION_LABELS.overdueEmpty}
            titleEn={ATTENTION_LABELS.overdueEmptyEn}
          />
          <p className="panel-note">{ATTENTION_LABELS.overdueAwaitingData}</p>
        </div>
      ) : null}

      {overdueItems.length ? (
        <div className="attention-section attention-section-overdue">
          <ProgressModuleHeading
            as="h4"
            className="attention-section-title overdue"
            title={ATTENTION_LABELS.overdueTitle}
            titleEn={ATTENTION_LABELS.overdueTitleEn}
            trailing={<span className="attention-count-badge overdue">{overdueItems.length}</span>}
          />
          <ul className="attention-overdue-list">
            {overdueItems.map(({ control, planDue, overdueDays }) => (
              <li key={control.id}>
                <button
                  type="button"
                  className={`attention-overdue-item is-overdue ${selectedId === control.id ? "active" : ""}`}
                  onClick={() => onSelect(control.id)}
                >
                  <div>
                    <div className="attention-item-badges">
                      <span className="progress-flag overdue">
                        {ATTENTION_LABELS.overdueBadge}
                        {overdueDays ? ` ${overdueDays} 天` : ""}
                      </span>
                    </div>
                    <strong>{control.title}</strong>
                    <small> · {control.id}</small>
                    <p className="attention-item-meta">
                      {ATTENTION_LABELS.dueLabel}：{planDue || "—"}
                      {control.owner ? (
                        <>
                          {" · "}
                          <ProgressOwnerLabel owner={control.owner} compact inline />
                        </>
                      ) : null}
                    </p>
                  </div>
                  <span className={`progress-pill compact workspace-status ${workspaceStatusClass(control.workspaceStatus)}`}>
                    {labelOfWorkspaceStatus(control.workspaceStatus)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {staleItems.length ? (
        <div className="attention-section attention-section-stale">
          <ProgressModuleHeading
            as="h4"
            className="attention-section-title stale"
            title={ATTENTION_LABELS.staleTitle}
            titleEn={ATTENTION_LABELS.staleTitleEn}
            trailing={<span className="attention-count-badge stale">{staleItems.length}</span>}
          />
          <ul className="attention-overdue-list">
            {staleItems.map(({ control, task, reason }) => (
              <li key={control.id}>
                <button
                  type="button"
                  className={`attention-overdue-item is-stale ${selectedId === control.id ? "active" : ""}`}
                  onClick={() => onSelect(control.id)}
                >
                  <div>
                    <strong>{control.title}</strong>
                    <small> · {control.id}</small>
                    <p className="attention-item-meta">
                      {reason}
                      {resolveControlPlanDue(control, task)
                        ? ` · ${ATTENTION_LABELS.dueLabel}：${resolveControlPlanDue(control, task)}`
                        : ""}
                      {control.owner ? (
                        <>
                          {" · "}
                          <ProgressOwnerLabel owner={control.owner} compact inline />
                        </>
                      ) : null}
                    </p>
                  </div>
                  <span className={`progress-pill compact workspace-status ${workspaceStatusClass(control.workspaceStatus)}`}>
                    {labelOfWorkspaceStatus(control.workspaceStatus)}
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
