"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNotificationViaHTTP_V1 = exports.sendBatchNotifications = exports.sendNotification = exports.initializeFirebase = void 0;
const admin = __importStar(require("firebase-admin"));
const google_auth_library_1 = require("google-auth-library");
let isInitialized = false;
let accessToken;
let projectId;
/**
 * Initializes the Firebase admin SDK
 * @param options - Initialization options
 * @returns Firebase app instance
 */
const initializeFirebase = (options) => __awaiter(void 0, void 0, void 0, function* () {
    if (isInitialized) {
        console.warn("Firebase Admin is already initialized");
        return admin.app();
    }
    try {
        const app = admin.initializeApp(Object.assign({ credential: admin.credential.cert(options.serviceAccount) }, (options.config || {})));
        isInitialized = true;
        if (typeof options.serviceAccount === "string") {
            throw new Error("Service account must be an object, not a string");
        }
        const object = options.serviceAccount;
        accessToken = yield getAccessToken({
            clientEmail: object.client_email,
            privateKey: object.private_key,
        });
        projectId = object.project_id;
        return app;
    }
    catch (error) {
        console.error("Firebase initialization error:", error);
        throw new Error("Failed to initialize Firebase Admin SDK");
    }
});
exports.initializeFirebase = initializeFirebase;
function getAccessToken(serviceAccountJson) {
    return __awaiter(this, void 0, void 0, function* () {
        const auth = new google_auth_library_1.GoogleAuth({
            credentials: {
                client_email: serviceAccountJson.clientEmail,
                private_key: serviceAccountJson.privateKey,
            },
            scopes: ["https://www.googleapis.com/auth/firebase.messaging"],
        });
        const client = yield auth.getClient();
        const accessTokenResponse = yield client.getAccessToken();
        if (!accessTokenResponse || !accessTokenResponse.token) {
            throw new Error("Failed to retrieve access token");
        }
        return accessTokenResponse.token;
    });
}
/**
 * Sends a notification using Firebase Cloud Messaging
 * @param options - Notification options
 * @returns Promise resolving to message ID
 */
const sendNotification = (options) => __awaiter(void 0, void 0, void 0, function* () {
    if (!isInitialized) {
        throw new Error("Firebase Admin SDK not initialized. Call initialize() first.");
    }
    const { token, title, body, data, imageUrl } = options;
    const messaging = admin.messaging();
    const message = Object.assign({ notification: Object.assign({ title,
            body }, (imageUrl && { imageUrl })), token }, (data && { data }));
    try {
        const response = yield messaging.send(message);
        console.log("FCM sent successfully", response);
        return response;
    }
    catch (error) {
        console.error("Error sending message:", error);
        throw error;
    }
});
exports.sendNotification = sendNotification;
/**
 * Sends multiple notifications in batch
 * @param notifications - Array of notification options
 * @returns Promise resolving to array of results
 */
const sendBatchNotifications = (notifications) => __awaiter(void 0, void 0, void 0, function* () {
    if (!isInitialized) {
        throw new Error("Firebase Admin SDK not initialized. Call initialize() first.");
    }
    const messaging = admin.messaging();
    const messages = notifications.map((notification) => (Object.assign({ notification: Object.assign({ title: notification.title, body: notification.body }, (notification.imageUrl && { imageUrl: notification.imageUrl })), token: notification.token }, (notification.data && { data: notification.data }))));
    try {
        const response = yield messaging.sendEach(messages);
        return response;
    }
    catch (error) {
        console.error("Error sending batch messages:", error);
        throw error;
    }
});
exports.sendBatchNotifications = sendBatchNotifications;
/**
 * Sends multiple notifications in batch
 * @param options - Array of notification options
 * @returns Promise
 */
const sendNotificationViaHTTP_V1 = (options) => __awaiter(void 0, void 0, void 0, function* () {
    // Add a small delay to ensure everything is properly initialized
    yield new Promise((resolve) => setTimeout(resolve, 5000));
    if (!isInitialized) {
        throw new Error("Firebase Admin SDK not initialized. Call initialize() first.");
    }
    if (!accessToken) {
        throw new Error("Access token is required to send notifications from frontend");
    }
    const message = {
        message: Object.assign({ token: options.token, notification: Object.assign({ title: options.title, body: options.body }, (options.imageUrl && { image: options.imageUrl })) }, (options.data && { data: options.data })),
    };
    try {
        const response = yield fetch(`https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(message),
        });
        if (!response.ok) {
            const errorData = yield response.json();
            throw new Error(`FCM error: ${JSON.stringify(errorData)}`);
        }
        const result = yield response.json();
        console.log("Notification sent successfully:", result);
        return result;
    }
    catch (error) {
        console.error("Error sending notification from frontend:", error);
        throw error;
    }
});
exports.sendNotificationViaHTTP_V1 = sendNotificationViaHTTP_V1;
//# sourceMappingURL=index.js.map