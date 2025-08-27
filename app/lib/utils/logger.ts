export const logger = {
  info: (message: string, data?: any) => {
    if (process.env.NODE_ENV === "development") {
      console.log(message, data);
    }
  },
  error: (message: string, error?: any) => {
    console.error(message, error);
  },
};
