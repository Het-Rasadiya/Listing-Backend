import mongoose from "mongoose";
import { setServers } from "node:dns/promises";

setServers(["1.1.1.1", "8.8.8.8"]);

export const dbConnection = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL!);
    console.log("DB connected Successfully...");
  } catch (error) {
    console.log(`Error in DB Connection: ${error}`);
  }
};
