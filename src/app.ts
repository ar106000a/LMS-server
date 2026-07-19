import { env } from "./config/env.js";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./modules/auth/routes/auth.routes";
import courseRoutes from "./modules/courses/routes/course.routes.js";
import sectionRoutes from "./modules/sections/routes/sections.routes.js";
import userRoutes from "./modules/users/routes/user.routes";
import lessonRoutes from "./modules/lesson/routes/lessons.routes";
import mediaRoutes from "./modules/media/routes/media.routes";
import enrollmentRoutes from "./modules/enrollment/routes/enrollment.route.js";
import progressRoutes from "./modules/progress/routes/progress.route.js";
import certificateRoutes from "./modules/certificates/routes/certificate.route.js";

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
app.use("/api/users", userRoutes);
app.use("/api/", courseRoutes);
app.use("/api/", sectionRoutes);
app.use("/api/", lessonRoutes);
app.use("/api/", mediaRoutes);
app.use("/api/", enrollmentRoutes);
app.use("/api/", progressRoutes);
app.use("/api/", certificateRoutes);
