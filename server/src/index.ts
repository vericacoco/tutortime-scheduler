import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import slotsRouter from "./routes/slots.js";
import aiRouter from "./routes/ai.js";
import googleAuthRouter from "./routes/googleAuth.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    message: "Scheduler API is running",
  });
});

console.log("Slots router loaded");

app.use("/api/slots", slotsRouter);
app.use("/api/ai", aiRouter);
app.use("/api/auth/google", googleAuthRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});