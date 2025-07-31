import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from '@/components/ui/input'; 
import { authSchema, type AuthInput } from "@/schemas/auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { toast } from "sonner";
import { auth } from '@/services/endpoints/auth'; 
import { useAuthStore } from '@/store/use-auth';
import { useNavigate } from "react-router-dom";
 
export default function Auth() { 
  const navigate = useNavigate();
   const setTokens = useAuthStore((state) => state.setTokens);

  const {isPending, mutateAsync} = useMutation({
    mutationFn: async (input: AuthInput) => {
      const { data } = await auth.login(input);
      return data;
    }, 
  }); 

  const form = useForm<{ email: string; password: string }>({
    resolver: zodResolver(authSchema), 
  }); 

  const onSubmit = async (data: AuthInput) => {
    try {
      const { data: {accessToken, refreshToken, idToken} } = await mutateAsync(data);

      setTokens({ accessToken, refreshToken, idToken });  
    } catch (error) {
      if (error instanceof AxiosError) {

        if (error.response?.data.message === "User not confirmed") {
          toast.error("Please confirm your account first.");
          navigate(`/confirm?email=${data.email}`);
          return;
        }

        toast.error(error.response?.data.message);
      }
      console.error(error);  
    }   
  };

  const onGoogleLogin = async () => {
    window.location.href = `${import.meta.env.VITE_COGNITO_URL}`;  

    navigate('/redirect')
  }

  return (
     <Card className="w-full h-full flex flex-col items-center justify-center p-6">
        <h1 className="text-2xl font-bold">Login</h1>
        <CardContent className="w-full">
          <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-8">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <Input
                {...form.register("email")}
                type="email"  
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label> 
              <Input
                {...form.register("password")}
                type="password" 
                required
              />
            </div> 
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Logging in..." : "Login"}
            </Button> 
          </form>
          </Form>

          <Button
            type="button"
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
            onClick={onGoogleLogin}
          >
            Entrar com Google
          </Button>
        </CardContent>
    </Card>    
  );
}
