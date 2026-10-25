import { Router } from "express";
import { google } from "googleapis";
import "dotenv/config";

const router = Router();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

const SCOPES = [
  "https://www.googleapis.com/auth/calendar.readonly",
];

router.get("/", (_req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: SCOPES,
    include_granted_scopes: true,
  });

  res.redirect(authUrl);
});

router.get("/callback", async (req, res) => {
  try {
    const code = req.query.code as string;

    if (!code) {
      return res.status(400).send("Missing authorization code.");
    }

    const { tokens } = await oauth2Client.getToken(code);

    oauth2Client.setCredentials(tokens);

    if (tokens.refresh_token) {
  console.log("Refresh Token Received");
}

    console.log("Google Calendar connected.");

    if (tokens.refresh_token) {
      console.log("Refresh Token Received");
    }

    return res.redirect(`${process.env.FRONTEND_URL}?calendar=connected`);
  } catch (error) {
    console.error("Google OAuth error:", error);

    return res.status(500).send("Google Calendar connection failed.");
  }
});

export default router;