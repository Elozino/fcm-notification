import * as admin from "firebase-admin";
import {
  NotificationOptions,
  InitOptions,
  FirebaseServiceAccount,
} from "./types";
import { GoogleAuth } from "google-auth-library";

let isInitialized = false;
let accessToken: string;
let projectId: string;

/**
 * Initializes the Firebase admin SDK
 * @param options - Initialization options
 * @returns Firebase app instance
 */
export const initializeFirebase = async (
  options: InitOptions
): Promise<admin.app.App> => {
  if (isInitialized) {
    console.warn("Firebase Admin is already initialized");
    return admin.app();
  }

  try {
    const app = admin.initializeApp({
      credential: admin.credential.cert(options.serviceAccount),
      ...(options.config || {}),
    });
    isInitialized = true;

    if (typeof options.serviceAccount === "string") {
      throw new Error("Service account must be an object, not a string");
    }

    const object = options.serviceAccount as FirebaseServiceAccount;
    accessToken = await getAccessToken({
      clientEmail: object.client_email,
      privateKey: object.private_key,
    });
    projectId = object.project_id;
    return app;
  } catch (error) {
    console.error("Firebase initialization error:", error);
    throw new Error("Failed to initialize Firebase Admin SDK");
  }
};

async function getAccessToken(
  serviceAccountJson: admin.ServiceAccount
): Promise<string> {
  const auth = new GoogleAuth({
    credentials: {
      client_email: serviceAccountJson.clientEmail,
      private_key: serviceAccountJson.privateKey,
    },
    scopes: ["https://www.googleapis.com/auth/firebase.messaging"],
  });

  const client = await auth.getClient();
  const accessTokenResponse = await client.getAccessToken();

  if (!accessTokenResponse || !accessTokenResponse.token) {
    throw new Error("Failed to retrieve access token");
  }

  return accessTokenResponse.token;
}

/**
 * Sends a notification using Firebase Cloud Messaging
 * @param options - Notification options
 * @returns Promise resolving to message ID
 */
export const sendNotification = async (
  options: NotificationOptions
): Promise<string> => {
  if (!isInitialized) {
    throw new Error(
      "Firebase Admin SDK not initialized. Call initialize() first."
    );
  }

  const { token, title, body, data, imageUrl } = options;
  const messaging = admin.messaging();

  const message: admin.messaging.Message = {
    notification: {
      title,
      body,
      ...(imageUrl && { imageUrl }),
    },
    token,
    ...(data && { data }),
  };

  try {
    const response = await messaging.send(message);
    console.log("FCM sent successfully", response);
    return response;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

/**
 * Sends multiple notifications in batch
 * @param notifications - Array of notification options
 * @returns Promise resolving to array of results
 */
export const sendBatchNotifications = async (
  notifications: NotificationOptions[]
): Promise<admin.messaging.BatchResponse> => {
  if (!isInitialized) {
    throw new Error(
      "Firebase Admin SDK not initialized. Call initialize() first."
    );
  }

  const messaging = admin.messaging();
  const messages = notifications.map((notification) => ({
    notification: {
      title: notification.title,
      body: notification.body,
      ...(notification.imageUrl && { imageUrl: notification.imageUrl }),
    },
    token: notification.token,
    ...(notification.data && { data: notification.data }),
  }));

  try {
    const response = await messaging.sendEach(messages);
    return response;
  } catch (error) {
    console.error("Error sending batch messages:", error);
    throw error;
  }
};

/**
 * Sends multiple notifications in batch
 * @param options - Array of notification options
 * @returns Promise
 */
export const sendNotificationViaHTTP_V1 = async (
  options: NotificationOptions
): Promise<{
  name: string;
}> => {
  // Add a small delay to ensure everything is properly initialized
  await new Promise((resolve) => setTimeout(resolve, 5000));

  if (!isInitialized) {
    throw new Error(
      "Firebase Admin SDK not initialized. Call initialize() first."
    );
  }
  if (!accessToken) {
    throw new Error(
      "Access token is required to send notifications from frontend"
    );
  }

  const message = {
    message: {
      token: options.token,
      notification: {
        title: options.title,
        body: options.body,
        ...(options.imageUrl && { image: options.imageUrl }),
      },
      ...(options.data && { data: options.data }),
    },
  };

  try {
    const response = await fetch(
      `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`FCM error: ${JSON.stringify(errorData)}`);
    }

    const result = await response.json();

    console.log("Notification sent successfully:", result);

    return result;
  } catch (error) {
    console.error("Error sending notification from frontend:", error);
    throw error;
  }
};
