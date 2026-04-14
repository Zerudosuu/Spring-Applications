import { useCallback, useState } from "react";
import axiosInstance from "@/api/axiosInstance";
import { toast } from "sonner";

export type UserRole = "USER" | "ADMIN" | "TRIAGE";

export interface UserSummary {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

const useUsers = () => {
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const updateUsersCache = useCallback((nextUsers: UserSummary[]) => {
    setUsers(nextUsers);
    return nextUsers;
  }, []);

  const getAllUsers = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await axiosInstance.get<UserSummary[]>("/users");
      return updateUsersCache(response.data);
    } catch {
      setUsers([]);
      setError("Failed to load users.");
      toast.error("Failed to load users.");
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [updateUsersCache]);

  const getAssignableUsers = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const [analysts, triage] = await Promise.all([
        axiosInstance.get<UserSummary[]>("/users/role", { params: { role: "USER" } }),
        axiosInstance.get<UserSummary[]>("/users/role", { params: { role: "TRIAGE" } }),
      ]);

      const merged = [...analysts.data, ...triage.data];
      const deduped = merged.filter(
        (user, index, all) => all.findIndex((candidate) => candidate.id === user.id) === index,
      );

      return updateUsersCache(deduped);
    } catch {
      setUsers([]);
      setError("Failed to load assignable users.");
      toast.error("Failed to load assignable users.");
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [updateUsersCache]);

  const updateUserRole = useCallback(async (userId: number, role: UserRole) => {
    try {
      const response = await axiosInstance.put<UserSummary>(`/users/${userId}/role`, null, {
        params: { role },
      });

      setUsers((prev) =>
        prev.map((user) => (user.id === userId ? response.data : user)),
      );

      toast.success("User role updated successfully!");
      return response.data;
    } catch (err) {
      toast.error("Failed to update user role.");
      throw err;
    }
  }, []);

  const deleteUser = useCallback(async (userId: number) => {
    try {
      await axiosInstance.delete(`/users/${userId}`);
      setUsers((prev) => prev.filter((user) => user.id !== userId));
      toast.success("User deleted successfully!");
    } catch (err) {
      toast.error("Failed to delete user.");
      throw err;
    }
  }, []);

  return {
    users,
    isLoading,
    error,
    getAllUsers,
    getAssignableUsers,
    updateUserRole,
    deleteUser,
  };
};

export default useUsers;