/**
 * Script to seed test contact data
 */

import mongoose from 'mongoose';
import { Contact } from '../src/modules/content/contact.model';
import { config } from '../src/core/config';

const seedContacts = async (): Promise<void> => {
  try {
    // Connect to MongoDB
    if (!config.mongodbUri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(config.mongodbUri);
    console.log('✅ Connected to MongoDB');

    // Check if contacts already exist
    const existingCount = await Contact.countDocuments();
    if (existingCount > 0) {
      console.log(`\n⚠️  Found ${existingCount} existing contacts.`);
      console.log('   Use --force flag to delete and recreate, or skip seeding.');
      await mongoose.disconnect();
      return;
    }

    // Create test contacts
    const testContacts = [
      {
        name: 'John Doe',
        email: 'john.doe@example.com',
        subject: 'Inquiry about organic honey',
        message: 'I would like to know more about your organic honey. What sizes do you offer?',
        status: 'new' as const,
      },
      {
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        subject: 'Business partnership inquiry',
        message: 'We are a local business interested in partnering with Foodworld Naturals to stock your natural food products.',
        status: 'read' as const,
      },
      {
        name: 'Mike Johnson',
        email: 'mike.j@example.com',
        subject: 'Question about cold-pressed oils',
        message: 'How do the cold-pressed oils differ from refined oils? Do you offer combo packs?',
        status: 'new' as const,
      },
      {
        name: 'Sarah Williams',
        email: 'sarah.w@example.com',
        subject: 'Bulk order for spices',
        message: 'We need a bulk quote for your whole spices and masalas for our restaurant. Can you provide pricing?',
        status: 'replied' as const,
      },
      {
        name: 'David Brown',
        email: 'david.brown@example.com',
        subject: 'General information request',
        message: 'I would like to learn more about your sourcing practices and delivery options.',
        status: 'archived' as const,
      },
    ];

    console.log('\n📝 Creating test contacts...');
    const created = await Contact.insertMany(testContacts);
    console.log(`✅ Created ${created.length} test contacts`);

    // Display created contacts
    console.log('\n📋 Created Contacts:');
    created.forEach((contact, index) => {
      console.log(`\n${index + 1}. ${contact.name} (${contact.email})`);
      console.log(`   Subject: ${contact.subject}`);
      console.log(`   Status: ${contact.status}`);
    });

    // Disconnect
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    console.log('\n💡 You can now view these contacts in the admin panel Inquiries page.');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

// Run the script
seedContacts();

