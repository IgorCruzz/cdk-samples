import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from '@/components/ui/input'; 
import {  confirmInput, confirmSchema } from "@/schemas/confirm";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { toast } from "sonner";
import { auth } from '@/services/endpoints/auth'; 
import { useNavigate, useSearchParams  } from "react-router-dom";
import { useEffect } from "react";
 
export default function Confirm() { 
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
   const email = searchParams.get("email");
  
  useEffect(() => { 
    if (!email) { 
      navigate('/');
    }
  }, [email]);
 
  const {isPending, mutateAsync} = useMutation({
    mutationFn: auth.confirm,
  }); 

  const form = useForm<{ code: string }>({
    resolver: zodResolver(confirmSchema), 
    defaultValues: { code: '' },
  }); 

  const onSubmit = async ({ code }: confirmInput) => {
    try {
      const { data  } = await mutateAsync({ code, email: email! }); 
      
      toast.success(data.message); 
      
      navigate('/login');  

    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.message);
      }
      console.error(error);  
      toast.error("An error occurred. Please try again.");
    }   
  }; 

  return (
     <Card className="w-full h-full flex flex-col items-center justify-center p-6">
        <h1 className="text-2xl font-bold">Confirmation</h1>
        <CardContent className="w-full">
          <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-8">
            <div>
              <label className="block text-sm font-medium text-gray-700">Code</label>
              <Input
                {...form.register("code")}
                type="code"  
                required
                maxLength={6}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Loading..." : "Confirm"}
            </Button> 
          </form>
          </Form> 
        </CardContent>
    </Card>    
  );
}
