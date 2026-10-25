import { useEffect, useState } from "react";
import "./App.css";

type Slot = {
  id: string;
  slot_date: string;
  start_time: string;
  duration_minutes: number;
};

function App() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);

  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState("");

  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [bookingName, setBookingName] = useState("");
  const [bookingEmail, setBookingEmail] = useState("");
  const [booking, setBooking] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState("");
  
  const loadSlots = async () => {
  try {
    setLoading(true);

    const response = await fetch("http://localhost:3001/api/slots");

    if (!response.ok) {
      throw new Error("Failed to load slots");
    }

    const data = await response.json();
    setSlots(data);
  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  loadSlots();
}, []);

const handleCreateSlot = async (
  event: React.FormEvent<HTMLFormElement>
) => {
  event.preventDefault();

  setFormError("");

  if (!date || !startTime) {
    setFormError("Please select a date and start time.");
    return;
  }

  try {
    setCreating(true);

    const response = await fetch("http://localhost:3001/api/slots", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        date,
        startTime,
        durationMinutes,
      }),
    });

   if (!response.ok) {
  const data = await response.json();

  if (response.status === 409) {
    setFormError(
      "This time overlaps with an existing lesson slot."
    );
    return;
  }

  throw new Error(data.message || "Failed to create slot");
}

    setDate("");
    setStartTime("");
    setDurationMinutes(30);

    await loadSlots();
  } catch (error) {
    console.error(error);
    setFormError("Could not create the lesson slot.");
  } finally {
    setCreating(false);
  }
};

const handleBookSlot = async (
  event: React.FormEvent<HTMLFormElement>
) => {
  event.preventDefault();

  if (!selectedSlot) return;

  setBookingError("");
  setBookingSuccess("");

  if (!bookingName.trim() || !bookingEmail.trim()) {
    setBookingError("Please enter your name and email.");
    return;
  }

  try {
    setBooking(true);

    const response = await fetch(
      `http://localhost:3001/api/slots/${selectedSlot.id}/book`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: bookingName,
          email: bookingEmail,
        }),
      }
    );

    const data = await response.json();

    if (response.status === 409) {
      setBookingError("This lesson was already booked.");
      await loadSlots();
      return;
    }

    if (!response.ok) {
      throw new Error(data.message || "Booking failed");
    }

    // Booking succeeded immediately
    setBookingSuccess("Your lesson has been booked successfully.");

    await loadSlots();

    // Ask Gemini for a nicer confirmation
    try {
      const aiResponse = await fetch(
        "http://localhost:3001/api/ai/confirmation",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: bookingName,
            date: data.slot.slot_date,
            startTime: data.slot.start_time,
            durationMinutes: data.slot.duration_minutes,
          }),
        }
      );

      if (aiResponse.ok) {
        const aiData = await aiResponse.json();

        if (aiData.confirmationMessage) {
          setBookingSuccess(aiData.confirmationMessage);
        }
      }
    } catch (error) {
      console.error("AI confirmation failed:", error);
    }
  } catch (error) {
    console.error("Booking failed:", error);
    setBookingError("Could not book this lesson.");
  } finally {
    setBooking(false);
  }
};

  return (
    <div className="page">
      <nav className="navbar">
        <div className="brand">
          <div className="logo">T</div>

          <div>
            <h3>TutorTime</h3>
            <span>Private lesson booking</span>
          </div>
        </div>

        <div className="status">
          <span className="status-dot" />
          Available for bookings
        </div>
      </nav>

      <main className="container">
        <section className="hero">
          <span className="eyebrow">SIMPLE SCHEDULING</span>

          <h1>
            Your next lesson,
            <br />
            <span>just one booking away.</span>
          </h1>

          <p>
            Choose a time that fits your schedule and reserve your private
            lesson in a few seconds.
          </p>
        </section>

        <div className="dashboard">
          <section className="availability-card">
  <div className="section-heading">
    <div>
      <span className="section-label">FOR THE TUTOR</span>
      <h2>Create availability</h2>
    </div>

    <div className="icon-box">+</div>
  </div>

  <form onSubmit={handleCreateSlot}>
    <div className="form-group">
      <label>Date</label>

      <input
        type="date"
        value={date}
        onChange={(event) => setDate(event.target.value)}
      />
    </div>

    <div className="form-row">
      <div className="form-group">
        <label>Start time</label>

        <input
          type="time"
          value={startTime}
          onChange={(event) => setStartTime(event.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Duration</label>

        <select
          value={durationMinutes}
          onChange={(event) =>
            setDurationMinutes(Number(event.target.value))
          }
        >
          <option value={15}>15 min</option>
          <option value={30}>30 min</option>
          <option value={45}>45 min</option>
          <option value={60}>60 min</option>
        </select>
      </div>
    </div>

    {formError && (
      <p className="form-error">{formError}</p>
    )}

    <button
      className="primary-btn"
      type="submit"
      disabled={creating}
    >
      {creating ? "Adding..." : "Add available time"}
    </button>
  </form>
</section>

          <section className="slots-card">
            <div className="section-heading">
              <div>
                <span className="section-label">FOR STUDENTS</span>
                <h2>Available lessons</h2>
              </div>

              <span className="slot-count">{slots.length} slots</span>
            </div>

            {loading ? (
              <div className="empty-state">
                <p>Loading available lessons...</p>
              </div>
            ) : slots.length === 0 ? (
              <div className="empty-state">
                <div className="calendar-icon">◷</div>

                <h3>No lessons available yet</h3>

                <p>
                  New lesson times will appear here as soon as the tutor adds
                  them.
                </p>
              </div>
            ) : (
              <div className="slot-list">
                {slots.map((slot) => (
                  <div className="slot-item" key={slot.id}>
                    <div className="date-box">
                      <span>
                        {new Date(slot.slot_date).toLocaleDateString("en-US", {
                          month: "short",
                        })}
                      </span>

                      <strong>
                        {new Date(slot.slot_date).getDate()}
                      </strong>
                    </div>

                    <div className="slot-info">
                      <strong>{slot.start_time.slice(0, 5)}</strong>

                      <span>{slot.duration_minutes} minute lesson</span>
                    </div>

                    <button
  className="book-btn"
  onClick={() => {
    setSelectedSlot(slot);
    setBookingError("");
    setBookingSuccess("");
  }}
>
  Book
</button>
                  </div>
                ))}
              </div>
            )}
          </section>
{selectedSlot && (
  <div
    className="modal-overlay"
    onClick={() => setSelectedSlot(null)}
  >
    <div
      className="booking-modal"
      onClick={(event) => event.stopPropagation()}
    >
      <button
        className="modal-close"
        onClick={() => setSelectedSlot(null)}
      >
        ×
      </button>

      {!bookingSuccess ? (
        <>
          <span className="section-label">BOOK YOUR LESSON</span>

          <h2>Confirm your lesson</h2>

          <div className="selected-slot">
            <div>
              <span>Date</span>
              <strong>
                {new Date(selectedSlot.slot_date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </strong>
            </div>

            <div>
              <span>Time</span>
              <strong>{selectedSlot.start_time.slice(0, 5)}</strong>
            </div>

            <div>
              <span>Duration</span>
              <strong>{selectedSlot.duration_minutes} min</strong>
            </div>
          </div>

          <form onSubmit={handleBookSlot}>
            <div className="form-group">
              <label>Your name</label>

              <input
                type="text"
                placeholder="Enter your name"
                value={bookingName}
                onChange={(event) =>
                  setBookingName(event.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label>Email</label>

              <input
                type="email"
                placeholder="you@example.com"
                value={bookingEmail}
                onChange={(event) =>
                  setBookingEmail(event.target.value)
                }
              />
            </div>

            {bookingError && (
              <p className="form-error">{bookingError}</p>
            )}

            <button
              type="submit"
              className="primary-btn"
              disabled={booking}
            >
              {booking ? "Booking..." : "Confirm booking"}
            </button>
          </form>
        </>
      ) : (
        <div className="success-state">
          <div className="success-check">✓</div>

          <h3>Lesson booked</h3>

          <p className="success-time">
            {new Date(selectedSlot.slot_date).toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
            {" · "}
            {selectedSlot.start_time.slice(0, 5)}
          </p>

          <p className="ai-message">
            {bookingSuccess}
          </p>
        </div>
      )}
    </div>
  </div>
)}
        </div>
      </main>
    </div>
  );
}

export default App;