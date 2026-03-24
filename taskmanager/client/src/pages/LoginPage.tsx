import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormData } from "../schemas/loginSchema";
import { useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function LoginPage() {
  // error message from API
  const [apiError, setApiError] = useState<string>("");

  // loading state while waiting for API
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { login } = useAuth();

  // useForm connects React Hook Form with Zod schema
  // zodResolver tells React Hook Form to use Zod for validation
  const {
    register, // connects input fields to the form
    handleSubmit, // wraps your submit function with validation
    formState: { errors }, // contains validation error messages
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // called only when form passes Zod validation
  const onSubmit = async (data: LoginFormData) => {
    setApiError("");
    setIsLoading(true);

    try {
      await login(data);
    } catch (error: any) {
      // show error message from Spring Boot
      setApiError(
        error.response?.data?.message || "Login failed. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>
            Sign in to your Task Manager account
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* API error message */}
            {apiError && (
              <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
                {apiError}
              </div>
            )}

            {/* Email field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@email.com"
                {...register("email")}
              />
              {/* Zod validation error */}
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit button */}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>

            {/* Link to register */}
            <p className="text-sm text-center text-gray-600">
              Don't have an account?{" "}
              <Link to="/register" className="text-blue-600 hover:underline">
                Register
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default LoginPage;
