import { initials, platformClass } from "../utils/taskUtils";

export function TaskCard({ task, onOpen }) {
  return (
    <article
      className="card"
      draggable
      tabIndex="0"
      aria-label={task.title}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen();
        }
      }}
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", task.id);
      }}
    >
      <div className="card-meta">
        <span className={`pill ${task.priority.toLowerCase()}`}>{task.priority}</span>
        <span className={`pill ${platformClass(task.platform)}`}>{task.platform}</span>
      </div>
      <h4 className="card-title">{task.title}</h4>
      <p className="card-desc">{task.description}</p>
      <div className="card-footer">
        <span>{task.id} · {task.comments?.length || 0} 批注</span>
        <span className="avatar" title={task.owner}>{initials(task.owner)}</span>
      </div>
    </article>
  );
}
