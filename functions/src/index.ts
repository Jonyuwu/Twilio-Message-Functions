import * as functions from "firebase-functions";
import * as dotenv from "dotenv";
import twilio from "twilio";
dotenv.config();
interface TwilioConfig {
  accountSid: string;
  authToken: string;
  phoneNumber: string;
}
const twilioConfig: TwilioConfig = {
  accountSid: process.env.TWILIO_ACCOUNT_SID || "",
  authToken: process.env.TWILIO_AUTH_TOKEN || "",
  phoneNumber: process.env.TWILIO_PHONE_NUMBER || "",
};
if (
  !twilioConfig.accountSid ||
  !twilioConfig.authToken ||
  !twilioConfig.phoneNumber
) {
  throw new Error("Missing Twilio configuration in environment variables");
}
const client = twilio(twilioConfig.accountSid, twilioConfig.authToken);
export const sendPanicMessage = functions.https.onRequest(async (req, res) => {
  const { to, body }: { to: string; body: string } = req.body;

  try {
    const message = await client.messages.create({
      to,
      from: twilioConfig.phoneNumber,
      body,
    });
    res.status(200).send(`Message sent: ${message.sid}`);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).send("Error sending message");
  }
});
