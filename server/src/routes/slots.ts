import { Router } from "express";
import { pool } from "../db/database.js";
import { generateBookingConfirmation } from "../services/geminiService.js";
import {
  getBusyPeriods,
  overlapsBusyPeriod,
} from "../services/googleCalendarService.js";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        TO_CHAR(slot_date, 'YYYY-MM-DD') AS slot_date,
        TO_CHAR(start_time, 'HH24:MI:SS') AS start_time,
        duration_minutes,
        is_booked,
        booked_by_name,
        booked_by_email,
        created_at
      FROM slots
      WHERE is_booked = false
      ORDER BY slot_date ASC, start_time ASC
    `);

    const slots = result.rows;

    if (slots.length === 0) {
      return res.status(200).json([]);
    }

    const firstDate = slots[0].slot_date;
    const lastDate = slots[slots.length - 1].slot_date;

    const timeMin = new Date(
      `${firstDate}T00:00:00+01:00`
    ).toISOString();

    const timeMax = new Date(
      `${lastDate}T23:59:59+01:00`
    ).toISOString();

    const busyPeriods = await getBusyPeriods(
      timeMin,
      timeMax
    );

    const availableSlots = slots.filter((slot) => {
      const slotStart = new Date(
        `${slot.slot_date}T${slot.start_time}+01:00`
      );

      const slotEnd = new Date(
        slotStart.getTime() +
          slot.duration_minutes * 60 * 1000
      );

      return !overlapsBusyPeriod(
        slotStart,
        slotEnd,
        busyPeriods
      );
    });

    return res.status(200).json(availableSlots);
  } catch (error) {
    console.error("Database error:", error);

    return res.status(500).json({
      message: "Failed to fetch slots",
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const { date, startTime, durationMinutes } = req.body;

    if (!date || !startTime || !durationMinutes) {
      return res.status(400).json({
        message: "Date, start time and duration are required",
      });
    }

    if (
      typeof durationMinutes !== "number" ||
      durationMinutes <= 0
    ) {
      return res.status(400).json({
        message: "Duration must be a positive number",
      });
    }

    // Check whether this slot overlaps an existing slot.
    const overlapResult = await pool.query(
      `
      SELECT id
      FROM slots
      WHERE slot_date = $1::date
        AND (slot_date + start_time)
              < (
                  $1::date
                  + $2::time
                  + make_interval(mins => $3)
                )
        AND (
              slot_date
              + start_time
              + make_interval(mins => duration_minutes)
            )
              > ($1::date + $2::time)
      LIMIT 1
      `,
      [date, startTime, durationMinutes]
    );

    if (overlapResult.rowCount && overlapResult.rowCount > 0) {
      return res.status(409).json({
        message: "This time overlaps with an existing lesson slot.",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO slots (
        slot_date,
        start_time,
        duration_minutes
      )
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [date, startTime, durationMinutes]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Database error:", error);

    return res.status(500).json({
      message: "Failed to create slot",
    });
  }
});

router.post("/:id/book", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        message: "Name and email are required",
      });
    }

    const result = await pool.query(
      `
      UPDATE slots
      SET
        is_booked = true,
        booked_by_name = $1,
        booked_by_email = $2
      WHERE id = $3
        AND is_booked = false
      RETURNING *
      `,
      [name, email, id]
    );

    if (result.rowCount === 0) {
      return res.status(409).json({
        message: "Slot is already booked or does not exist",
      });
    }

    const bookedSlot = result.rows[0];

return res.status(200).json({
  message: "Booking successful",
  slot: bookedSlot,
});
    
  } catch (error) {
    console.error("Booking error:", error);

    return res.status(500).json({
      message: "Failed to book slot",
    });
  }
});

export default router;