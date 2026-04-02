import { type Task } from '@/hooks/useTasks';
import TaskCard from './TaskCard';
import { ClipboardList } from 'lucide-react';

interface TaskListProps {
    tasks: Task[];
    onEdit: (task: Task) => void;
    onDelete: (id: number) => void;
}

function TaskList({ tasks, onEdit, onDelete }: TaskListProps) {
    if (tasks.length === 0) {
        return (
            <div className="text-center py-16">
                <ClipboardList className="h-16 w-16 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-400 text-lg font-medium">
                    No tasks found
                </p>
                <p className="text-gray-300 text-sm mt-1">
                    Create your first task or adjust your filters
                </p>
            </div>
        );
    }

    return (
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
