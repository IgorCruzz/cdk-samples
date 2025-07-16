export const internal = () => ({
  statusCode: 500,
  body: {
    message: "Internal Server Error",
    error: "An unexpected error occurred. Please try again later.",
  },
});
