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
import { useAuth } from "react-oidc-context";

import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
} from "@aws-sdk/client-cognito-identity-provider";


const REGION = "us-east-1"; 

const client = new CognitoIdentityProviderClient({ region: REGION });


export default function LoginPage() {   

  const form = useForm<{ email: string; password: string }>({
    resolver: zodResolver(authSchema), 
  }); 

  const onSubmit = async (data: AuthInput) => {
    try {
    const params = {
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: "5jt1ofjdv34b344lbiq1jj5av7",
      AuthParameters: {
        USERNAME: data.email,
        PASSWORD: data.password,
      },
    };

    const command = new InitiateAuthCommand(params);
    const response = await client.send(command);

    console.log({
      response
    });     
    } catch (error) {  
    switch (error.name) {
    case "UserNotFoundException":
      toast.error("Usuário não encontrado.");
      break;
    case "NotAuthorizedException":
      toast.error("Usuário ou senha incorretos.");
      break;
    case "UserNotConfirmedException":
      toast.error("Usuário não confirmado. Verifique seu e-mail.");
      break;
    case "PasswordResetRequiredException":
      toast.error("Senha precisa ser redefinida.");
      break;
    default:
      toast.error(error.message || "Erro desconhecido ao fazer login.");
    } 
    }   
  };

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
            <Button type="submit" className="w-full">
              Login
            </Button> 
          </form>
          </Form>
        </CardContent>
    </Card>    
  );
}
