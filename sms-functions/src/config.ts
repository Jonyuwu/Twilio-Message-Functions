import * as dotenv from "dotenv";
import { logger } from "firebase-functions/v2";

dotenv.config();

export const twilioConfig = {
  accountSid: `${process.env.TWILIO_ACCOUNT_SID}`,
  authToken: `${process.env.TWILIO_AUTH_TOKEN}`,
  phoneNumber: `${process.env.TWILIO_PHONE_NUMBER}`,
  fixedToCallerPhone: `${process.env.TWILIO_FIXED_TO_CALLER_PHONE}`,
};

export interface Customer {
  name: string;
  email: string;
}

export interface NewAlert {
  usruid: string;
  buttonTriggered: string;
  description: string;
  source: string;
  timestamp: any;
  location: any;
}

export interface EventButton {
  active: boolean;
  location: any;
  source: string;
  timestamp: any;
  uid: string;
}
export const eventRef = {
  ref: "/emergency-events/{userId}/buttons/{buttonId}",
  // instance: "spotme-8a76d", // db instance name
};

interface MessageLocation {
  lat: string;
  lng: string;
}

interface MessageBuilderOptions {
  to: string;
  name: string;
  location: MessageLocation;
}

interface Message {
  to: string;
  from: string;
  body: string;
}

export const messageBuilder = (opts: MessageBuilderOptions): Message => {
  const message = {
    to: opts.to,
    from: twilioConfig.phoneNumber,
    body: `${opts.name} needs your help. He has used SpotMe to request help. Open a map with the next data: lat: ${opts.location.lat} and lng: ${opts.location.lng}`,
  };

  logger.log(message);

  return message;
};
