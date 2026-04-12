import { z } from "zod";

const TicketStatus = z.enum([
	"OPEN",
	"IN_PROGRESS",
	"RESOLVED",
	"CLOSED",
	"REOPENED",
	"CANCELED",
]);

const Priority = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]);
const Category = z.enum(["BUG", "FEATURE", "TASK"]);

export const ticketSchema = z.object({
	title: z
		.string()
		.min(3, { message: "Title must be at least 3 characters long" })
		.max(255, { message: "Title must be at most 255 characters long" }),

	description: z
		.string()
		.max(1000, { message: "Description must be at most 1000 characters long" })
		.optional(),

	priority: Priority,
	category: Category,

	// kept optional because backend create currently forces OPEN.
	status: TicketStatus.optional(),

	assigneeId: z.number().int().positive({ message: "Assignee is required" }),

	dueDate: z.date({ message: "Due date is required" }),
});

export type TicketFormData = z.infer<typeof ticketSchema>;
