import { env } from "./config/env.js";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./modules/auth/routes/auth.routes";
import courseRoutes from "./modules/courses/routes/course.routes.js";
export const app = express();

//body-parser
app.use(express.json({ limit: "50mb" }));

//cookie-parser
app.use(cookieParser());

//cors
console.log(env.ORIGIN);
app.use(cors({ origin: env.ORIGIN, credentials: true }));

//Auth routes
app.use("/api/auth", authRoutes);
app.use("/api/", courseRoutes);
