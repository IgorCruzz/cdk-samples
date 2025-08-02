import { AxiosError } from "axios";
import { toast } from "sonner";

export const onError = (error: unknown) => {
    if (error instanceof AxiosError) {
        toast.error(error.response?.data.message);
        return
      }
      console.error(error);  
      toast.error("An error occurred. Please try again later.");  
}