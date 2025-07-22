import { Card, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { Form } from "@/components/ui/form";
import { users } from '@/services/endpoints/users';
import { useMutation } from '@tanstack/react-query';
import { toast } from "sonner";
import { useState } from "react";
import { userSchema, UserInput } from '@/schemas/users';
import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import { SendHorizontal } from "lucide-react";
import {
  Dialog,
  DialogContent, 
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Pencil } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { queryClient } from "@/lib/query-client";

type AddOrUpdateProps = {
  type: 'add' | 'update';
  user?: UserInput;
}

export function AddOrUpdate({ type, user }: AddOrUpdateProps) {
  const form = useForm({
    resolver: zodResolver(userSchema),
    mode: "onChange",
    defaultValues: {
      email: user?.email || '',
      name: user?.name || '',
      id: user?.id || ''
    }
  });

  const [loading, setLoading] = useState(false);  

  const { mutateAsync } = useMutation({
    mutationFn:  type === 'add' ? users.post : users.put 
  });

  const onSubmit = async (input: UserInput) => {
    try {
      setLoading(true);   
 
      const { data } = await mutateAsync(input);      

      toast.success(data.message); 

      form.reset();

      queryClient.invalidateQueries({ queryKey: ['users'] });
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.message);
      }
      console.error(error);
    } finally { 
      setLoading(false);
    }
  };

  return ( 
    <Dialog>
  <DialogTrigger asChild>
    <Button variant="outline" size="icon">
    {type === 'update' ? <Pencil /> : <Plus />} 
    </Button>       
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>{type === 'add' ?
      <p className="flex items-center justify-center gap-2"><Plus /> Add</p> : 
      <p className="flex items-center justify-center gap-2"><Pencil /> {user?.name}</p>
      }</DialogTitle>
    </DialogHeader>

    <Card>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 h-full">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <Input
                {...form.register("email")}
                type="email"  
                required
                readOnly={type === 'update'}  
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

            <Button type="submit" disabled={!form.formState.isValid || loading}>
              {loading ? `loading...` : <SendHorizontal />}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  </DialogContent>
</Dialog>

  );
}
