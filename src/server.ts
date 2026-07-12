import { env } from "./config/env";
import { NextFunction, Request, Response } from "express";
import { app } from "./app";
import connectDB from "./utils/db";
import { redisClient } from "./utils/redis";

connectDB();
redisClient.on("error", (err: Error) => {
  console.error("❌ Redis Connection Error:", err.message);
});

redisClient.on("connect", () => {
  console.log("🚀 Redis connected successfully!");
});

app.get("/", async (req: Request, res: Response) => {
  // res.send("Server listening");
  res.status(200).json({
    message: "Server Okay",
    success: true,
  });
});

app.use((req: Request, res: Response, next: NextFunction) => {
  const error = new Error(
    `Route not found: Cannot ${req.method} ${req.originalUrl} `,
  );
  res.status(404);
  next(error);
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    success: false,
    message: err.message,
    // Hide stack traces in production for security
    stack: env.NODE_ENV === "production" ? undefined : err.stack,
  });
});

app.listen(env.PORT, () => {
  console.log("App listening at port ", env.PORT);
});
