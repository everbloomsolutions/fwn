import * as admin from 'firebase-admin';
import { config } from './index';
import { logger } from '../middleware/logger';

let firebaseApp: admin.app.App | null = null;

export const initializeFirebase = (): void => {
  if (firebaseApp) {
    return;
  }

  try {
    // Check if Firebase credentials are provided
    if (!config.firebase?.projectId || !config.firebase?.privateKey || !config.firebase?.clientEmail) {
      logger.warn('Firebase credentials not provided. Push notifications will be disabled.');
      return;
    }

    // Initialize Firebase Admin SDK
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: config.firebase.projectId,
        privateKey: config.firebase.privateKey.replace(/\\n/g, '\n'),
        clientEmail: config.firebase.clientEmail,
      }),
    });

    logger.info('Firebase Admin SDK initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize Firebase Admin SDK:', error);
    firebaseApp = null;
  }
};

export const getFirebaseApp = (): admin.app.App | null => {
  if (!firebaseApp) {
    initializeFirebase();
  }
  return firebaseApp;
};

export const isFirebaseInitialized = (): boolean => {
  return firebaseApp !== null;
};

