import type { Task } from "../../hooks/useTasks";
import TaskCard from "./TaskCard";

interface TaskListProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
}

function TaskList({ tasks, onEdit, onDelete }: TaskListProps) {
  // empty state
  if (tasks.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-400 text-lg">No tasks yet</p>
        <p className="text-gray-300 text-sm mt-1">
          Create your first task to get started
        </p>
      </div>
    );
  }

  return (
    // responsive grid — 1 column on mobile, 2 on tablet, 3 on desktop
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

export default TaskList;
