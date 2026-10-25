import { Router } from "express";
import { generateBookingConfirmation } from "../services/geminiService.js";

const router = Router();

router.post("/confirmation", async (req, res) => {
  try {
    const { name, date, startTime, durationMinutes } = req.body;

    if (!name || !date || !startTime || !durationMinutes) {
      return res.status(400).json({
        message: "Missing confirmation data",
      });
    }

    const confirmationMessage =
      await generateBookingConfirmation({
        name,
        date,
        startTime,
        durationMinutes,
      });

    return res.status(200).json({
      confirmationMessage,
    });
  } catch (error) {
    console.error("AI route error:", error);

    return res.status(500).json({
      message: "Failed to generate confirmation",
    });
  }
});

export default router;