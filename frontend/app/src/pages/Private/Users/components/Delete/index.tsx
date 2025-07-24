import { Button } from "@/components/ui/button";
import { users } from "@/services/endpoints/users";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { Delete as DeleteIcon } from "lucide-react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import { UserInput } from "@/schemas/users";
import { queryClient } from "@/lib/query-client";
import { useState } from "react";

type DeleteProps = {
  user: Required<Pick<UserInput, "id" | "name">>;
};

export function Delete({ user }: DeleteProps) {
  const [open, setOpen] = useState(false);

  
  const { mutateAsync, isPending } = useMutation({
    mutationFn: users.delete,
  });

  const handleDelete = async () => {
    try {
      const { data } = await mutateAsync(user.id);
      toast.success(data.message);

      queryClient.invalidateQueries({ queryKey: ["users"] });
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.message);
      }
      console.error(error);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="icon">
          <DeleteIcon />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            Delete {user.name}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            Are you sure you want to delete this user? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              onClick={handleDelete}
              disabled={isPending}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {isPending ? "Deleting..." : "Yes, delete"}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
