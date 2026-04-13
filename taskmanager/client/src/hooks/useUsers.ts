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

      setUsers(deduped);
      return deduped;
    } catch {
      setUsers([]);
      setError("Failed to load assignable users.");
      toast.error("Failed to load assignable users.");
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    users,
    isLoading,
    error,
    getAssignableUsers,
  };
};

export default useUsers;