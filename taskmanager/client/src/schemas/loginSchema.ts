import { z } from "zod";

// z.object() defines the shape of the form data
// similar to @NotBlank and @Email annotations in Spring Boot DTOs

export const loginSchema = z.object({
  // email must be a string, not empty, and valid email format
  email: z
    .email({ message: "Invalid email address" })
    .min(1, { message: "Email is required" }),

  //password must be a string and at least 6 characters
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" }),
});

// extract the TypeScript type from the schema
// LoginFormData can now be used as a type anywhere in the app
// equivalent to your LoginRequestDTO in Spring Boot
export type LoginFormData = z.infer<typeof loginSchema>;
