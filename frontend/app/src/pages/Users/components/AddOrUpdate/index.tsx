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
import { Plus } from 'lucide-react';
import { Input } from "@/components/ui/input";

type AddOrUpdateProps = {
  type: 'add' | 'update';
  user?: UserInput;
}

export function AddOrUpdate({ type, user }: AddOrUpdateProps) {
  const form = useForm({
    resolver: zodResolver(userSchema),
    mode: "onChange",
  });

  const [loading, setLoading] = useState(false);  

  const { mutateAsync } = useMutation({
    mutationFn: users.post
  });

  const onSubmit = async (user: UserInput) => {
    try {
      setLoading(true); 

      const { data } = await mutateAsync(user);      

      toast.success(data.message); 

      form.reset();
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error('Oops! Something went wrong.');
      }
      console.error(error);
    } finally { 
      setLoading(false);
    }
  };

  return ( 
    <Dialog>
  <DialogTrigger className="btn">
    {type === 'update' ? 'Update User' : <Plus />}    
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>{type === 'add' ? 'Add User' : `Update  ${user?.name}`}</DialogTitle>
    </DialogHeader>

    <Card>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 h-full">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <Input
                {...form.register("name")}
                type="text"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <Input
                {...form.register("email")}
                type="email"  
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
