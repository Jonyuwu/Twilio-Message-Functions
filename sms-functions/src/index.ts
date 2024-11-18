/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// import * as v2 from "firebase-functions/v2";
import twilio from "twilio";

import * as admin from "firebase-admin";
import { onValueWritten } from "firebase-functions/database";
import { logger } from "firebase-functions/v2";
import {
  EventButton,
  eventRef as eventOpts,
  messageBuilder,
  NewAlert,
  twilioConfig,
} from "./config";
//:::::::::::::::::::::
//  Initialize the app
//:::::::::::::::::::::
admin.initializeApp();

const client = twilio(twilioConfig.accountSid, twilioConfig.authToken);

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

export const fnOnValueWritten = onValueWritten(eventOpts, (event) => {
  //:::::::::::::::::::::
  // Event validation
  //:::::::::::::::::::::

  if (!event.data.after.exists()) {
    return null;
  }
  const buttonData: EventButton | null = event.data.after.exportVal();

  // Break if RECEIVED BAD event payload
  if (!buttonData) {
    logger.log("BAD EVENT PAYLOAD", buttonData);
    return null;
  }

  // Break if DEACTIVATION event was received
  if ("active" in buttonData && !buttonData.active) {
    logger.log("DEACTIVATION EVENT", buttonData);

    return null;
  }

  //:::::::::::::::::::
  //  Fetch contacts for the user
  //:::::::::::::::::::

  // const contacts = admin
  // admin
  //   .firestore()
  //   .collection("contacts")
  //   .where("customer_id", "==", `customers/${event.params.userId}`)
  //   .get()
  //   .then((querySnapshot) => {
  //     querySnapshot.forEach((doc) => {
  //       logger.info("CONTACTS", doc.id, " => ", doc.data());
  //     });
  //   })
  //   .catch((error) => {
  //     logger.error("Error getting documents: ", error);
  //   });

  //:::::::::::::::::::
  // Fetch customer
  //:::::::::::::::::::
  // let customer: Customer | null | undefined = null;

  admin
    .firestore()
    .doc(`customers/${event.params.userId}`)
    .get()
    .then((querySnapshot) => {
      if (querySnapshot.exists) {
        // customer = querySnapshot.data();
        logger.log("DATA ON SNAP", querySnapshot.data());
      }
      logger.log("DATA ON SNAP???", querySnapshot.data());
    })
    .catch((error) => {
      logger.error("Error getting documents: ", error);
    });

  //:::::::::::::::::::
  // Create a new Alert log
  //:::::::::::::::::::

  if (
    !twilioConfig.accountSid ||
    !twilioConfig.authToken ||
    !twilioConfig.phoneNumber
  ) {
    logger.log("BAD TWILIO CONFIG", twilioConfig);

    const eventParams: NewAlert = {
      ...buttonData,
      usruid: event.params.userId,
      description: "Emergency Alert Triggered. Could not send SMS",
      buttonTriggered: buttonData.uid,
    };

    return event.data.after.ref.parent?.parent
      ?.child("alerts")
      .push(eventParams);
  } else {
    const opts = {
      name: "A Person",
      to: twilioConfig.fixedToCallerPhone,
      location: buttonData.location,
    };
    logger.log("OPTS: ", opts);
    //:::::::::::::::::::
    // Send SMS Notification
    //:::::::::::::::::::
    client.messages
      .create(messageBuilder(opts))
      .then((message: any) => logger.log(message.sid))
      .catch((error: any) => {
        logger.log("ERRORED SENDING MESSAGE", error);
      });

    const eventParams: NewAlert = {
      ...buttonData,
      usruid: event.params.userId,
      description: "Emergency Alert Triggered",
      buttonTriggered: buttonData.uid,
    };

    return event.data.after.ref.parent?.parent
      ?.child("alerts")
      .push(eventParams);
  }
});
