import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from '@/components/ui/input'; 
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { toast } from "sonner"; 
import { SendHorizontal } from "lucide-react";
import {  signUpInput, signUpSchema} from "@/schemas/signup";
import { auth } from "@/services/endpoints/auth";
import { useState } from "react";
import PasswordValidation from "@/components/PasswordValidation";
import { useNavigate } from 'react-router-dom'

export default function Signup() {  
  const navigate = useNavigate();
  const [password, setPassword] = useState("");

  const { isPending, mutateAsync } = useMutation({
    mutationFn: auth.signup    
  }); 

  const form = useForm({
    resolver: zodResolver(signUpSchema),
    mode: "onChange",
  }); 

  const onSubmit = async (input: signUpInput) => {
    try {    
      const { data } = await mutateAsync(input);      
      toast.success(data.message); 
      form.reset(); 

      navigate("/"); 
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.message);
      }
      console.error(error);
    } 
  }; 

  return (
    <Card className="w-full h-full flex flex-col items-center justify-center p-6">
      <h1 className="text-2xl font-bold">Sign up</h1>
      <CardContent className="w-full">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 h-full">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <Input
                {...form.register("email")}
                type="email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <Input
                {...form.register("name")}
                type="text"
                required
              />
            </div>

             <div>
        <label className="block text-sm font-medium text-gray-700">Password</label>
        <Input
          {...form.register("password")}
          type="password"
          required
          onChange={(e) => {
            form.setValue("password", e.target.value, {
              shouldValidate: true,
              shouldDirty: true,
            });
            setPassword(e.target.value);
          }}
          value={password}
        />
        <PasswordValidation password={password} />
      </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
              <Input
                {...form.register("confirmPassword")}
                type="password"
                required
              />
            </div>

            <Button variant="outline" type="submit" disabled={!form.formState.isValid}>
              {isPending ? `loading...` : <SendHorizontal />}
            </Button>
          </form>
        </Form> 
      </CardContent>
    </Card>    
  );
}
