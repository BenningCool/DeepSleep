import { COLUMNS } from "../data/mockData";
import { getWorkflowHint } from "../modules/scope-init/scopeRules";
import { labelOfSystem } from "../modules/scope-init/scopeSystems";
import { columnTitle } from "../utils/taskUtils";

export function TaskDrawer({ open, editingTask, draft, commentDraft, allTasks = [], onClose, onChange, onCommentChange, onSave, onDelete }) {
  return (
    <>
      <div className={`overlay ${open ? "open" : ""}`} onClick={onClose} />
      <aside className={`drawer ${open ? "open" : ""}`} aria-label="Task Details" aria-hidden={!open}>
        <header className="drawer-header">
          <div>
            <h2>{editingTask ? editingTask.title : "Create Task"}</h2>
            <p>
              {editingTask
                ? `${editingTask.id} · Current stage: ${columnTitle(editingTask.status)}`
                : "Enter task content, fields, and comments."}
            </p>
            {editingTask && getWorkflowHint(editingTask, allTasks) ? (
              <p className="drawer-hint">{getWorkflowHint(editingTask, allTasks)}</p>
            ) : null}
          </div>
          <button className="button icon" type="button" aria-label="Close" onClick={onClose}>×</button>
        </header>

        <section className="drawer-body">
          {draft.scopeMeta ? (
            <section className="scope-meta-card" aria-label="Scope Information">
              <span className="label">Scope Information</span>
              <p>{draft.scopeMeta.projectName}</p>
              {draft.scopeMeta.systems?.length ? (
                <p className="scope-meta-systems">
                  Key Systems:{draft.scopeMeta.systems.map(labelOfSystem).join(", ")}
                </p>
              ) : null}
            </section>
          ) : null}

          <form id="taskForm" className="form-grid" onSubmit={onSave}>
            <FormField label="Title" full>
              <input required maxLength="90" value={draft.title} onChange={(event) => onChange("title", event.target.value)} placeholder="Example: Audit Customization Logic / Reconciliation Rules" />
            </FormField>
            <FormField label="Description" full>
              <textarea value={draft.description} onChange={(event) => onChange("description", event.target.value)} placeholder="Enter requirement body, business context, or acceptance criteria" />
            </FormField>
            <FormField label="Priority">
              <select value={draft.priority} onChange={(event) => onChange("priority", event.target.value)}>
                <option value="P0">P0</option>
                <option value="P1">P1</option>
                <option value="P2">P2</option>
              </select>
            </FormField>
            <FormField label="Status">
              <select value={draft.status} onChange={(event) => onChange("status", event.target.value)}>
                {COLUMNS.map((column) => <option key={column.id} value={column.id}>{column.title}</option>)}
              </select>
            </FormField>
            <FormField label="Platform">
              <select value={draft.platform} onChange={(event) => onChange("platform", event.target.value)}>
                <option value="PC">PC</option>
                <option value="Mobile">Mobile</option>
                <option value="Backend">Backend</option>
                <option value="AI">AI</option>
              </select>
            </FormField>
            <FormField label="Product Line">
              <input value={draft.product} onChange={(event) => onChange("product", event.target.value)} placeholder="DeepSleep Project Kanban" />
            </FormField>
            <FormField label="Owner">
              <input value={draft.owner} onChange={(event) => onChange("owner", event.target.value)} placeholder="Owner" />
            </FormField>
            <FormField label="Due Date">
              <input value={draft.due} onChange={(event) => onChange("due", event.target.value)} type="date" />
            </FormField>
            <FormField label="Comments" full>
              <textarea value={commentDraft} onChange={(event) => onCommentChange(event.target.value)} placeholder="Add a new comment. It will be appended to the task after saving." />
            </FormField>
          </form>

          <section aria-label="Comment History">
            <span className="label">Comment History</span>
            <div className="comments">
              {draft.comments?.length ? draft.comments.map((comment, index) => (
                <div className="comment" key={`${comment.author}-${index}`}>
                  <strong>{comment.author || "Member"}</strong>
                  <p>{comment.text}</p>
                </div>
              )) : <div className="empty">No comments yet. You can append comments when saving.</div>}
            </div>
          </section>
        </section>

        <footer className="drawer-footer">
          <div className="footer-group">
            {editingTask ? <button className="button danger" type="button" onClick={onDelete}>Delete</button> : null}
          </div>
          <div className="footer-group">
            <button className="button" type="button" onClick={onClose}>Cancel</button>
            <button className="button primary" form="taskForm" type="submit">Save</button>
          </div>
        </footer>
      </aside>
    </>
  );
}

function FormField({ label, full = false, children }) {
  return <label className={`field ${full ? "full" : ""}`}><span className="label">{label}</span>{children}</label>;
}
