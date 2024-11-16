/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import * as v2 from "firebase-functions/v2";
// import {onRequest} from "firebase-functions/v2/https";
// import * as logger from "firebase-functions/logger";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// const newalert = v2++;

const newalert = v2.database.onValueWritten(
  {
    ref: "/emergency-events/{userId}/buttons/{buttonId}",
    instance: "spotme-8a76d-default-rtdb",
  },
  (event) => {
    console.log(event);
    const original = event.data.after.val();
    console.log("USER_ID", event.params.userId, original);
    console.log("BUTTON_ID", event.params.buttonId, original);

    return event.data.after.ref.parent?.child("panic").set(true);
    // …
  }
);
