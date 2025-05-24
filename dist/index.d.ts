import * as admin from "firebase-admin";
import { NotificationOptions, InitOptions } from "./types";
/**
 * Initializes the Firebase admin SDK
 * @param options - Initialization options
 * @returns Firebase app instance
 */
export declare const initializeFirebase: (options: InitOptions) => Promise<admin.app.App>;
/**
 * Sends a notification using Firebase Cloud Messaging
 * @param options - Notification options
 * @returns Promise resolving to message ID
 */
export declare const sendNotification: (options: NotificationOptions) => Promise<string>;
/**
 * Sends multiple notifications in batch
 * @param notifications - Array of notification options
 * @returns Promise resolving to array of results
 */
export declare const sendBatchNotifications: (notifications: NotificationOptions[]) => Promise<admin.messaging.BatchResponse>;
/**
 * Sends multiple notifications in batch
 * @param options - Array of notification options
 * @returns Promise
 */
export declare const sendNotificationViaHTTP_V1: (options: NotificationOptions) => Promise<{
    name: string;
}>;
//# sourceMappingURL=index.d.ts.map