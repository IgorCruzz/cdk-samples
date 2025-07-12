export type Output<T = null> = Promise<{
  data: T | null;
  message: string;
  success: boolean;
}>;
