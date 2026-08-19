/**
 * Script to list all admin users in the database
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

const listAdminUsers = async (): Promise<void> => {
  try {
    if (!config.mongodbUri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    await mongoose.connect(config.mongodbUri);
    logger.info('Connected to MongoDB');

    const adminUsers = await User.find({ role: 'admin' })
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();

    if (adminUsers.length === 0) {
      console.log('\n📭 No admin users found in the database.\n');
      await mongoose.connection.close();
      return;
    }

    console.log('\n👑 Admin Users in Database:\n');
    console.log('═'.repeat(120));
    console.log(
      `${'Email'.padEnd(35)} ${'Name'.padEnd(25)} ${'Status'.padEnd(10)} ${'OAuth'.padEnd(15)} ${'Created'.padEnd(12)} ${'ID'.padEnd(25)}`
    );
    console.log('═'.repeat(120));

    adminUsers.forEach((user: any) => {
      const email = (user.email || '').padEnd(35);
      const name = (user.name || 'N/A').padEnd(25);
      const status = (user.isActive ? '✅ Active' : '❌ Inactive').padEnd(10);
      const oauth = (user.oauthProvider || 'None').padEnd(15);
      const created = new Date(user.createdAt).toLocaleDateString().padEnd(12);
      const id = (user._id?.toString() || '').padEnd(25);

      console.log(`${email} ${name} ${status} ${oauth} ${created} ${id}`);
    });

    console.log('═'.repeat(120));
    console.log(`\n📊 Summary:`);
    console.log(`   Total Admin Users: ${adminUsers.length}`);
    console.log(`   Active Admins: ${adminUsers.filter((u: any) => u.isActive).length}`);
    console.log(`   Inactive Admins: ${adminUsers.filter((u: any) => !u.isActive).length}`);
    console.log(`   OAuth Admins: ${adminUsers.filter((u: any) => u.oauthProvider).length}`);
    console.log(`   Email/Password Admins: ${adminUsers.filter((u: any) => !u.oauthProvider).length}\n`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    logger.error('Error listing admin users:', error);
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

listAdminUsers();
