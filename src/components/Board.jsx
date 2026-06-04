import { TaskCard } from "./TaskCard";

export function Board({ columns, tasks, onOpenTask, onMoveTask }) {
  return (
    <section className="board-wrap" aria-label="JIRA 风格 Kanban 看板">
      <div className="board">
        {columns.map((column) => {
          const columnTasks = tasks.filter((task) => task.status === column.id);
          return (
            <section className="column" aria-label={column.title} key={column.id}>
              <header className="column-header">
                <h3>{column.title}</h3>
                <span className="count">{columnTasks.length}</span>
              </header>
              <div
                className="card-list"
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  onMoveTask(event.dataTransfer.getData("text/plain"), column.id);
                }}
              >
                {columnTasks.length ? columnTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onOpen={() => onOpenTask(task)}
                  />
                )) : <div className="empty">没有匹配任务<br />可拖入或新建卡片</div>}
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
}
