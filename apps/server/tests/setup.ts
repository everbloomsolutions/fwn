import mongoose from 'mongoose';
import { config } from '../src/core/config';

// Test database connection
export const setupTestDB = async (): Promise<void> => {
  const testMongoUri = process.env.TEST_MONGODB_URI || config.mongodbUri;
  
  if (!testMongoUri) {
    throw new Error('MongoDB URI not configured for tests');
  }

  await mongoose.connect(testMongoUri);
};

// Clean up database after tests
export const cleanupTestDB = async (): Promise<void> => {
  try {
    if (mongoose.connection.readyState === 1) {
      const collections = mongoose.connection.collections;
      const collectionNames = Object.keys(collections);
      
      // Delete all documents from all collections
      for (const collectionName of collectionNames) {
        try {
          await collections[collectionName].deleteMany({});
        } catch (error) {
          // Ignore individual collection errors
        }
      }
    }
  } catch (error) {
    // Ignore errors during cleanup
  }
};

// Close database connection
export const closeTestDB = async (): Promise<void> => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
};
