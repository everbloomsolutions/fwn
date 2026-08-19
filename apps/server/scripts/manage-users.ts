/**
 * User management script
 * Lists all users in the database
 * 
 * Usage:
 *   npm run manage-users                    # List all users
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { User } from '../src/modules/user/user.model';
import { logger } from '../src/core/middleware/logger';
import { config } from '../src/core/config';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

interface UserInfo {
  _id: string;
  email: string;
  name?: string;
  role: 'user' | 'admin';
  isActive: boolean;
  oauthProvider?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * List all users in the database
 */
const listUsers = async (): Promise<void> => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 }).lean();
    
    if (users.length === 0) {
      console.log('\n📭 No users found in the database.\n');
      return;
    }

    console.log('\n📋 Users in database:\n');
    console.log('─'.repeat(100));
    console.log(
      `${'Email'.padEnd(30)} ${'Name'.padEnd(20)} ${'Role'.padEnd(8)} ${'Status'.padEnd(10)} ${'OAuth'.padEnd(12)} Created`
    );
    console.log('─'.repeat(100));

    users.forEach((user: any) => {
      const email = (user.email || '').padEnd(30);
      const name = (user.name || 'N/A').padEnd(20);
      const role = (user.role || 'user').padEnd(8);
      const status = (user.isActive ? 'Active' : 'Inactive').padEnd(10);
      const oauth = (user.oauthProvider || 'None').padEnd(12);
      const created = new Date(user.createdAt).toLocaleDateString();
      
      console.log(`${email} ${name} ${role} ${status} ${oauth} ${created}`);
    });

    console.log('─'.repeat(100));
    console.log(`\nTotal users: ${users.length}`);
    
    const adminCount = users.filter((u: any) => u.role === 'admin').length;
    const userCount = users.filter((u: any) => u.role === 'user').length;
    const activeCount = users.filter((u: any) => u.isActive).length;
    
    console.log(`  - Admins: ${adminCount}`);
    console.log(`  - Regular users: ${userCount}`);
    console.log(`  - Active: ${activeCount}`);
    console.log(`  - Inactive: ${users.length - activeCount}\n`);
  } catch (error) {
    logger.error('Error listing users:', error);
    throw error;
  }
};

/**
 * Main function
 */
const main = async (): Promise<void> => {
  try {
    // Connect to database
    if (!config.mongodbUri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    await mongoose.connect(config.mongodbUri);
    logger.info('Connected to MongoDB');

    // List users
    await listUsers();

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    logger.error('Script failed:', error);
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

main();
