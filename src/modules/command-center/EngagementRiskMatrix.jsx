import { formatCompletionLabel } from "./managementCopy";

function formatOverdue(count) {
  if (!count) return "—";
  return String(count);
}

export function EngagementRiskMatrix({
  rows = [],
  showEmColumn = true,
  onOpenProgress,
  onOpenDetail
}) {
  if (!rows.length) {
    return (
      <div className="empty-state compact">
        <p>暂无所辖项目。</p>
      </div>
    );
  }

  return (
    <div className="risk-matrix-wrap">
      <table className="risk-matrix-table">
        <thead>
          <tr>
            <th scope="col">关注级别</th>
            <th scope="col">客户 / 项目</th>
            {showEmColumn ? <th scope="col">负责 EM</th> : null}
            <th scope="col">报告日</th>
            <th scope="col">逾期程序</th>
            <th scope="col">完成度</th>
            <th scope="col">操作</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const { project, urgency, overdueCount, completion, risk, managerLabel } = row;

            return (
              <tr key={project.id} className={`risk-matrix-row ${risk.className}`}>
                <td>
                  <span className={`risk-tier-pill ${risk.className}`}>
                    {risk.labelZh}
                  </span>
                </td>
                <td className="risk-matrix-engagement">
                  <strong>{project.clientName || project.name}</strong>
                  <span>{project.name}</span>
                </td>
                {showEmColumn ? (
                  <td className="risk-matrix-em">{managerLabel}</td>
                ) : null}
                <td className="risk-matrix-report">
                  <span className="report-readable">{urgency.readableLabel}</span>
                  {urgency.compactLabel && urgency.compactLabel !== urgency.readableLabel ? (
                    <span className={`report-tier-pill compact ${urgency.className}`}>
                      {urgency.compactLabel}
                    </span>
                  ) : null}
                </td>
                <td className={overdueCount ? "team-stat-overdue" : "muted"}>
                  {formatOverdue(overdueCount)}
                </td>
                <td>{formatCompletionLabel(completion)}</td>
                <td>
                  <div className="risk-matrix-actions">
                    <button
                      className="button primary compact"
                      type="button"
                      onClick={() => onOpenProgress(project.id)}
                    >
                      项目进度
                    </button>
                    <button
                      className="button subtle compact"
                      type="button"
                      onClick={() => onOpenDetail(project.id)}
                    >
                      项目概览
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
