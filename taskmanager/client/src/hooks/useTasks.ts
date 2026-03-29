import { useState, useEffect, useCallback } from "react";
import axiosInstance from "@/api/axiosInstance";
import useAuthStore from "@/store/authStore";

//to match springboot task entity response
export interface Task {
  id: number;
  title: string;
  description: string;
  status: "TODO" | "IN_PROGRESS" | "DONE" | "CANCELLED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  dueDate: string; // ISO date string
  createdAt?: string; // ISO date string
  updatedAt?: string; // ISO date string
  userId: number;
}

//matches Spring Boot Task requestDTO
export interface TaskRequest {
  title: string;
  description?: string;
  status: "TODO" | "IN_PROGRESS" | "DONE" | "CANCELLED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  dueDate?: string; // ISO date string
  userId: number;
}

const useTasks = () => {
  const { user } = useAuthStore();

  //local state for tasks list
  const [tasks, setTasks] = useState<Task[]>([]);

  //loading state = true while fetching tasks
  const [isLoading, setIsLoading] = useState<boolean>(false);

  //errors state
  const [error, setError] = useState<string>("");

  console.log("useTasks - user:", user);

  const getTasks = useCallback(async () => {
    if (!user) return; //no user, no tasks

    setIsLoading(true);
    setError("");

    try {
      //GET /api/tasks?userId={userId}
      const response = await axiosInstance.get<Task[]>(`tasks/user/${user.id}`);
      setTasks(response.data); //update local state with fetched tasks
    } catch (err) {
      setError("Failed to fetch tasks. Please try again.");
      console.error("Get tasks error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const createTask = async (taskData: TaskRequest) => {
    //POST /api/tasks
    const response = await axiosInstance.post<Task>("/tasks", {
      ...taskData,
      userId: user?.id, //ensure task is associated with current user
    });

    //add new task to local state
    setTasks((prevTasks) => [...prevTasks, response.data]);
    return response.data;
  };

  const updateTask = async (taskId: number, taskData: TaskRequest) => {
    //PUT /api/tasks/{id}
    const response = await axiosInstance.put<Task>(`/tasks/${taskId}`, {
      ...taskData,
      userId: user?.id, //ensure task is associated with current user
    });
    //update task in local state

    setTasks((prevTasks) =>
      prevTasks.map((task) => (task.id === taskId ? response.data : task)),
    );
    return response.data;
  };

  const deleteTask = async (taskId: number) => {
    //DELETE /api/tasks/{id}
    await axiosInstance.delete(`/tasks/${taskId}`);
    //remove task from local state
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
  };

  // useEffect runs getTasks when component first mounts
  // empty array [] means run once on mount only
  // similar to @PostConstruct in Spring Boot
  useEffect(() => {
    if (user) getTasks();
  }, [user, getTasks]);

  return {
    tasks,
    isLoading,
    error,
    getTasks,
    createTask,
    updateTask,
    deleteTask,
  };
};

export default useTasks;
