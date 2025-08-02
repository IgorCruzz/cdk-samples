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
import { Separator } from "@/components/ui/separator"

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
            <Button variant="outline" type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Logging in..." : "Login"}
            </Button> 
          </form>
          </Form>
          <Separator className="my-4" />
          <Button
  type="button"
  variant="outline"
  className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
  onClick={onGoogleLogin}
>
  <svg
    className="w-5 h-5"
    viewBox="0 0 533.5 544.3"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M533.5 278.4c0-17.4-1.4-34-4.2-50.2H272v95.1h146.9c-6.4 34.6-25.5 63.9-54.3 83.4v68h87.5c51.2-47.1 81.4-116.4 81.4-196.3z"
      fill="#4285F4"
    />
    <path
      d="M272 544.3c73.8 0 135.6-24.5 180.7-66.5l-87.5-68c-24.3 16.3-55.4 25.7-93.2 25.7-71.7 0-132.4-48.3-154.1-113.2h-90.6v70.8c45.4 89.5 138.5 151.2 244.7 151.2z"
      fill="#34A853"
    />
    <path
      d="M117.9 322.3c-10.5-31.4-10.5-65.4 0-96.8v-70.8H27.3c-38.5 76.7-38.5 161.7 0 238.4l90.6-70.8z"
      fill="#FBBC04"
    />
    <path
      d="M272 107.7c39.9 0 75.7 13.7 103.8 40.8l77.8-77.8C407.6 24.5 345.8 0 272 0 165.8 0 72.7 61.7 27.3 151.2l90.6 70.8c21.7-64.9 82.4-113.2 154.1-113.2z"
      fill="#EA4335"
    />
  </svg>
  Entrar com Google
</Button>

        </CardContent>
    </Card>    
  );
}
