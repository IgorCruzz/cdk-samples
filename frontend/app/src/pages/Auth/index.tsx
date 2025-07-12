import { useState, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { z } from "zod";
import { Input } from '@/components/ui/input'; 
 
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type LoginInput = z.infer<typeof loginSchema>;

interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export default function LoginPage() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [validationError, setValidationError] = useState<string>("");

  const loginMutation = useMutation<LoginResponse, Error, LoginInput>({
    mutationFn: async (input: LoginInput) => {
      const { data } = await axios.post<LoginResponse>("/api/login", input);
      return data;
    },
    onSuccess: (data) => {
      console.log("Logged in", data);
    },
    onError: (error) => {
      console.error("Login failed", error);
    },
  });
 

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const parseResult = loginSchema.safeParse({ email, password });
    if (!parseResult.success) {
      setValidationError(parseResult.error.errors[0].message);
      return;
    }
    setValidationError("");
    loginMutation.mutate({ email, password });
  };

  return (
     <Card className="w-full h-full flex flex-col items-center justify-center p-6">
        <h1 className="text-2xl font-bold">Login</h1>
        <CardContent className="w-full">
          <form onSubmit={handleSubmit} className="flex flex-col gap-8">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label> 
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {validationError && (
              <p className="text-sm text-red-500">{validationError}</p>
            )}
            <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? "Logging in..." : "Login"}
            </Button>
            {loginMutation.isError && (
              <p className="text-sm text-red-500">Login failed. Try again.</p>
            )}
          </form>
        </CardContent>
    </Card>    
  );
}
