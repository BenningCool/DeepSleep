import { COLUMNS } from "../data/mockData";
import { getWorkflowHint } from "../modules/scope-init/scopeRules";
import { labelOfSystem } from "../modules/scope-init/scopeSystems";
import { columnTitle } from "../utils/taskUtils";

export function TaskDrawer({ open, editingTask, draft, commentDraft, allTasks = [], onClose, onChange, onCommentChange, onSave, onDelete }) {
  return (
    <>
      <div className={`overlay ${open ? "open" : ""}`} onClick={onClose} />
      <aside className={`drawer ${open ? "open" : ""}`} aria-label="任务详情" aria-hidden={!open}>
        <header className="drawer-header">
          <div>
            <h2>{editingTask ? editingTask.title : "新建任务"}</h2>
            <p>
              {editingTask
                ? `${editingTask.id} · 当前阶段：${columnTitle(editingTask.status)}`
                : "填写任务内容、字段和批注。"}
            </p>
            {editingTask && getWorkflowHint(editingTask, allTasks) ? (
              <p className="drawer-hint">{getWorkflowHint(editingTask, allTasks)}</p>
            ) : null}
          </div>
          <button className="button icon" type="button" aria-label="关闭" onClick={onClose}>×</button>
        </header>

        <section className="drawer-body">
          {draft.scopeMeta ? (
            <section className="scope-meta-card" aria-label="Scope 信息">
              <span className="label">Scope 信息</span>
              <p>{draft.scopeMeta.projectName}</p>
              {draft.scopeMeta.systems?.length ? (
                <p className="scope-meta-systems">
                  关键系统：{draft.scopeMeta.systems.map(labelOfSystem).join("、")}
                </p>
              ) : null}
            </section>
          ) : null}

          <form id="taskForm" className="form-grid" onSubmit={onSave}>
            <FormField label="标题" full>
              <input required maxLength="90" value={draft.title} onChange={(event) => onChange("title", event.target.value)} placeholder="例如：审计定制化的逻辑/勾稽关系" />
            </FormField>
            <FormField label="描述" full>
              <textarea value={draft.description} onChange={(event) => onChange("description", event.target.value)} placeholder="填写需求正文、业务背景或验收要点" />
            </FormField>
            <FormField label="优先级">
              <select value={draft.priority} onChange={(event) => onChange("priority", event.target.value)}>
                <option value="P0">P0</option>
                <option value="P1">P1</option>
                <option value="P2">P2</option>
              </select>
            </FormField>
            <FormField label="状态">
              <select value={draft.status} onChange={(event) => onChange("status", event.target.value)}>
                {COLUMNS.map((column) => <option key={column.id} value={column.id}>{column.title}</option>)}
              </select>
            </FormField>
            <FormField label="端">
              <select value={draft.platform} onChange={(event) => onChange("platform", event.target.value)}>
                <option value="PC 端">PC 端</option>
                <option value="移动端">移动端</option>
                <option value="后端">后端</option>
                <option value="AI">AI</option>
              </select>
            </FormField>
            <FormField label="产品线">
              <input value={draft.product} onChange={(event) => onChange("product", event.target.value)} placeholder="DeepSleep 项目看板" />
            </FormField>
            <FormField label="负责人">
              <input value={draft.owner} onChange={(event) => onChange("owner", event.target.value)} placeholder="负责人" />
            </FormField>
            <FormField label="截止日期">
              <input value={draft.due} onChange={(event) => onChange("due", event.target.value)} type="date" />
            </FormField>
            <FormField label="批注" full>
              <textarea value={commentDraft} onChange={(event) => onCommentChange(event.target.value)} placeholder="添加新的批注，保存后会追加到任务" />
            </FormField>
          </form>

          <section aria-label="历史批注">
            <span className="label">历史批注</span>
            <div className="comments">
              {draft.comments?.length ? draft.comments.map((comment, index) => (
                <div className="comment" key={`${comment.author}-${index}`}>
                  <strong>{comment.author || "成员"}</strong>
                  <p>{comment.text}</p>
                </div>
              )) : <div className="empty">暂无批注，保存时可追加新的批注。</div>}
            </div>
          </section>
        </section>

        <footer className="drawer-footer">
          <div className="footer-group">
            {editingTask ? <button className="button danger" type="button" onClick={onDelete}>删除</button> : null}
          </div>
          <div className="footer-group">
            <button className="button" type="button" onClick={onClose}>取消</button>
            <button className="button primary" form="taskForm" type="submit">保存</button>
          </div>
        </footer>
      </aside>
    </>
  );
}

function FormField({ label, full = false, children }) {
  return <label className={`field ${full ? "full" : ""}`}><span className="label">{label}</span>{children}</label>;
}
