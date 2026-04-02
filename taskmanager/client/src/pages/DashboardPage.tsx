import { useMemo, useState } from "react";
import useTasks, { type Task, type TaskRequest } from "@/hooks/useTasks";
import TaskList from "@/components/tasks/TaskList";
import TaskForm from "@/components/tasks/TaskForm";
import TaskFilter, { type FilterState } from '@/components/tasks/TaskFilter';
import DeleteConfirm from "@/components/tasks/DeleteConfirm";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import TaskSkeleton from '@/components/tasks/TaskSkeleton';

function DashboardPage() {
  const { tasks, isLoading, error, createTask, updateTask, deleteTask } =
    useTasks();

  // ─── FORM MODAL STATE ─────────────────────────────────────────
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);

  // selectedTask null = create mode, Task object = edit mode
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // ─── DELETE MODAL STATE ───────────────────────────────────────
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  // ─── FILTER STATE ─────────────────────────────────────────────
  // default values — ALL means no filter applied
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    status: "ALL",
    priority: "ALL",
  });

  // ─── FILTERED TASKS ───────────────────────────────────────────
    // useMemo recomputes filteredTasks only when tasks or filters change
    // prevents unnecessary recalculation on every render
    // similar to @Cacheable in Spring Boot

    const filteredTasks = useMemo(() => { 
      return tasks.filter((task) => { 

        const matchesSearch = task.title.toLowerCase().includes(filters.search.toLowerCase());
        const matchesStatus = filters.status === "ALL" || task.status === filters.status;
        const matchesPriority = filters.priority === "ALL" || task.priority === filters.priority;
        return matchesSearch && matchesStatus && matchesPriority;

      });
    }, [tasks, filters]);

  // ─── STATS ────────────────────────────────────────────────────
  const stats = {
    total: tasks?.length ?? 0,
    todo: tasks?.filter((t) => t.status === "TODO").length ?? 0,
    inProgress: tasks?.filter((t) => t.status === "IN_PROGRESS").length ?? 0,
    done: tasks?.filter((t) => t.status === "DONE").length ?? 0,
  };

  // ─── HANDLERS ─────────────────────────────────────────────────

  // open form in create mode
  const handleCreateNew = () => {
    setSelectedTask(null);
    setIsFormOpen(true);
  };

  // open form in edit mode with task data
  const handleEdit = (task: Task) => {
    setSelectedTask(task);
    setIsFormOpen(true);
  };

  // open delete confirmation dialog
  const handleDeleteClick = (id: number) => {
    const task = tasks.find((t) => t.id === id);
    if (task) {
      setTaskToDelete(task);
      setIsDeleteOpen(true);
    }
  };

  // called when TaskForm submits
  // decides whether to create or update based on selectedTask
  const handleFormSubmit = async (data: TaskRequest) => {
    if (selectedTask) {
      // edit mode — update existing task
      await updateTask(selectedTask.id, data);
    } else {
      // create mode — create new task
      await createTask(data);
    }
  };

  // called when delete is confirmed
  const handleDeleteConfirm = async () => {
    if (taskToDelete) {
      await deleteTask(taskToDelete.id);
      setTaskToDelete(null);
    }
  };
// resets all filters back to default
    const handleClearFilters = () => {
        setFilters({
            search: '',
            status: 'ALL',
            priority: 'ALL',
        });
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

            {/* filter bar */}
            <TaskFilter
                filters={filters}
                onFilterChange={setFilters}
                onClear={handleClearFilters}
            />

            {/* error state */}
            {error && (
                <div className="p-4 text-red-500 bg-red-50 rounded-md mb-4">
                    {error}
                </div>
            )}

            {/* show how many results match the filter */}
            {!isLoading && (
                <p className="text-sm text-gray-400 mb-4">
                    Showing {filteredTasks.length} of {tasks.length} tasks
                </p>
            )}

          
             {isLoading ? (
                // show 6 skeleton cards while loading
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <TaskSkeleton key={index} />
                    ))}
                </div>
            ) : (
                <TaskList
                    tasks={filteredTasks}
                    onEdit={handleEdit}
                    onDelete={handleDeleteClick}
                />
            )}

            {/* Task Form Modal */}
            <TaskForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSubmit={handleFormSubmit}
                task={selectedTask}
            />

            {/**Hotdog */}
            {/* Delete Confirmation Modal */}
            <DeleteConfirm
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={handleDeleteConfirm}
                taskTitle={taskToDelete?.title ?? ''}
            />
        </div>
  );
}

export default DashboardPage;
