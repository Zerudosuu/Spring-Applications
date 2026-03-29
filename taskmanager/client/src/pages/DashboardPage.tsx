import { useState } from "react";
import useTasks, { type Task } from "../hooks/useTasks";
import TaskList from "../components/tasks/TaskList";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

import useAuthStore from "@/store/authStore";

function DashboardPage() {
  const { user } = useAuthStore();
  const { tasks, isLoading, error, deleteTask } = useTasks();

  // selected task for editing — null means no task selected
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // controls task form modal visibility
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);

  // ─── STATS ────────────────────────────────────────────────────
  const stats = {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === "TODO").length,
    inProgress: tasks.filter((t) => t.status === "IN_PROGRESS").length,
    done: tasks.filter((t) => t.status === "DONE").length,
  };

  // ─── HANDLERS ─────────────────────────────────────────────────
  const handleEdit = (task: Task) => {
    setSelectedTask(task);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    await deleteTask(id);
  };

  const handleCreateNew = () => {
    setSelectedTask(null); // null = create mode
    setIsFormOpen(true);
  };

  return (
    <div>
      {/* page header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Tasks</h1>
        <Button onClick={handleCreateNew}>
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>

      {/* stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg border p-4 text-center">
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
          <p className="text-sm text-gray-500">Total</p>
        </div>
        <div className="bg-white rounded-lg border p-4 text-center">
          <p className="text-2xl font-bold text-gray-500">{stats.todo}</p>
          <p className="text-sm text-gray-500">To Do</p>
        </div>
        <div className="bg-white rounded-lg border p-4 text-center">
          <p className="text-2xl font-bold text-blue-500">{stats.inProgress}</p>
          <p className="text-sm text-gray-500">In Progress</p>
        </div>
        <div className="bg-white rounded-lg border p-4 text-center">
          <p className="text-2xl font-bold text-green-500">{stats.done}</p>
          <p className="text-sm text-gray-500">Done</p>
        </div>
      </div>

      {/* error state */}
      {error && (
        <div className="p-4 text-red-500 bg-red-50 rounded-md mb-4">
          {error}
        </div>
      )}

      {/* loading state */}
      {isLoading ? (
        <div className="text-center py-16">
          <p className="text-gray-400">Loading tasks...</p>
        </div>
      ) : (
        <TaskList tasks={tasks} onEdit={handleEdit} onDelete={handleDelete} />
      )}

      {
        /* TaskFormModal would go here, passing selectedTask and isFormOpen */
        isFormOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">
                {selectedTask ? "Edit Task" : "Create New Task"}
              </h2>

              {/* Task form fields would go here, pre-filled with selectedTask data if editing */}

              <Button onClick={() => setIsFormOpen(false)} className="mt-4">
                Close
              </Button>
            </div>
          </div>
        )
      }
    </div>
  );
}

export default DashboardPage;
