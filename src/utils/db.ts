import { env } from "../config/env";
import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const data = await mongoose.connect(env.DATABASE_URL).then((data: any) => {
      console.log(`Database connected with ${data.connection.host}`);
    });
  } catch (error: any) {
    console.log(error.message);
  }
};
export default connectDB;
