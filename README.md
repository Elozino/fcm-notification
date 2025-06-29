# Firebase Notification Library

A simple TypeScript-based library to send Firebase Cloud Messaging (FCM) notifications. This library makes it easy to integrate or test Firebase notifications into your applications.


<p style="font-size: 20px">Installation</p>

```bash
npm install @elozino/fcm-notification
```
or

```bash
yarn add @elozino/fcm-notification
```

## Usage

### 1. Import the library:
```typescript
import { initializeFirebase, sendNotification } from "@elozino/fcm-notification";
```

### 2. Initialize Firebase:

```typescript
import serviceAccount from "./path-to-your-google-service-account.json";
import { InitOptions } from "@elozino/fcm-notification/dist/types";

const app = initializeFirebase({
  serviceAccount: serviceAccount as InitOptions['serviceAccount'],
});

console.log("Firebase initialized:", app);
```

Example Service Account File ```(serviceAccount.json)```

```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "your-private-key-id",
  "private_key": "-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n",
  "client_email": "your-client-email@your-project-id.iam.gserviceaccount.com",
  "client_id": "your-client-id",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/your-client-email"
}
```

### 3. Send a notification:
Once Firebase is initialized, you can send notifications to devices using their FCM tokens:

```typescript
const token = "your-device-token";

sendNotification({
  token,
  title: "Hello!",
  body: "This is a test notification."
})
  .then(() => console.log("Notification sent successfully!"))
  .catch((err) => console.error("Failed to send notification:", err));
  
await sendBatchNotifications([
  {
    token: 'token1',
    title: 'Hello 1',
    body: 'Message 1'
  },
  {
    token: 'token2',
    title: 'Hello 2',
    body: 'Message 2'
  }
]);

sendNotificationViaHTTP_V1({
  token,
  title: "Hello!",
  body: "This is from a frontend app notification."
})

## PS: `sendNotificationFromFrontend` uses the HTTP v1
```



### API Reference
| Name | Type | Description |
| ------ | ------ | ------ |
| serviceAccount | ```ServiceAccount``` | The service account object containing the credentials for Firebase. |
| token | ```string``` | The FCM token of the device you want to send the notification to. |
| title |```string``` | The title of the notification. |
| body | ```string``` | The body of the notification. |
