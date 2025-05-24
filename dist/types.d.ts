import { ServiceAccount } from 'firebase-admin';
export interface NotificationOptions {
    /** The FCM device token */
    token: string;
    /** The title of the notification */
    title: string;
    /** The body of the notification */
    body: string;
    /** Optional image URL for the notification */
    imageUrl?: string;
    /** Optional key-value pairs for the notification payload */
    data?: Record<string, string>;
}
export interface InitOptions {
    /** Firebase service account credentials */
    serviceAccount: ServiceAccount | string;
    /** Additional Firebase app configuration options */
    config?: {
        databaseURL?: string;
        storageBucket?: string;
        projectId?: string;
    };
}
export type SendNotificationFromFrontendOptions = NotificationOptions & InitOptions["config"] & {
    serverKey: string;
};
export interface FirebaseServiceAccount {
    type: string;
    project_id: string;
    private_key_id: string;
    private_key: string;
    client_email: string;
    client_id: string;
    auth_uri: string;
    token_uri: string;
    auth_provider_x509_cert_url: string;
    client_x509_cert_url: string;
    universe_domain: string;
}
//# sourceMappingURL=types.d.ts.map