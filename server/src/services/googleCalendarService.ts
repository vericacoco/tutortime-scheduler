import "dotenv/config";
import { google } from "googleapis";

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const redirectUri = process.env.GOOGLE_REDIRECT_URI;
const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

if (!clientId || !clientSecret || !redirectUri || !refreshToken) {
  throw new Error("Missing Google Calendar environment variables");
}

const oauth2Client = new google.auth.OAuth2(
  clientId,
  clientSecret,
  redirectUri
);

oauth2Client.setCredentials({
  refresh_token: refreshToken,
});

const calendar = google.calendar({
  version: "v3",
  auth: oauth2Client,
});

type BusyPeriod = {
  start?: string | null;
  end?: string | null;
};

export async function getBusyPeriods(
  timeMin: string,
  timeMax: string
): Promise<BusyPeriod[]> {
  try {
    const response = await calendar.freebusy.query({
      requestBody: {
        timeMin,
        timeMax,
        timeZone: "Europe/Skopje",
        items: [{ id: "primary" }],
      },
    });

    return response.data.calendars?.primary?.busy ?? [];
  } catch (error) {
    console.error("Google Calendar error:", error);
    return [];
  }
}

export function overlapsBusyPeriod(
  slotStart: Date,
  slotEnd: Date,
  busyPeriods: BusyPeriod[]
): boolean {
  return busyPeriods.some((busy) => {
    if (!busy.start || !busy.end) {
      return false;
    }

    const busyStart = new Date(busy.start);
    const busyEnd = new Date(busy.end);

    return slotStart < busyEnd && slotEnd > busyStart;
  });
}