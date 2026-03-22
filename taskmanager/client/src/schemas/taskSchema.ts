import { z } from "zod";

// must match your backend enums exactly
// TaskStatus and Priority from your Spring Boot enums
const TaskStatus = z.enum(["TODO", "IN_PROGRESS", "DONE", "CANCELLED"]);
const Priority = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]);

export const taskSchema = z.object({
  title: z
    .string()
    .min(3, { message: "Title must be at least 3 characters long" })
    .max(255, { message: "Title must be at most 255 characters long" }),

  description: z
    .string()
    .max(500, { message: "Description must be at most 500 characters long" })
    .optional(),

  priority: Priority,

  status: TaskStatus,

  // dueDate is optional — coerce converts string input to Date object
  // HTML date inputs return strings so we need to convert
  dueDate: z.coerce
    .date({ message: "Must be a valid date" })
    .optional()
    .nullable(),
});

export type TaskData = z.infer<typeof taskSchema>;
