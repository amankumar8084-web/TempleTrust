import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import bcrypt from 'bcryptjs';
import Role from '../models/Role.js';
import User from '../models/User.js';
import TempleInfo from '../models/TempleInfo.js';
import Settings from '../models/Settings.js';

dotenv.config();

const rolesData = [
  {
    name: 'Visitor',
    permissions: ['read:announcements', 'read:gallery', 'read:temple', 'create:contact'],
    isSystem: true
  },
  {
    name: 'Devotee',
    permissions: [
      'read:announcements', 'read:gallery', 'read:temple', 'create:contact',
      'create:donation', 'read:my-donations',
      'create:booking', 'read:my-bookings',
      'create:event-registration', 'read:my-events',
      'create:volunteer-registration', 'create:membership'
    ],
    isSystem: true
  },
  {
    name: 'Volunteer',
    permissions: [
      'read:announcements', 'read:gallery', 'read:temple', 'create:contact',
      'create:donation', 'read:my-donations',
      'create:booking', 'read:my-bookings',
      'create:event-registration', 'read:my-events',
      'read:volunteer-duties', 'update:volunteer-duties'
    ],
    isSystem: true
  },
  {
    name: 'Staff',
    permissions: [
      'read:announcements', 'read:gallery', 'read:temple', 'create:contact',
      'create:donation', 'read:my-donations',
      'create:booking', 'read:my-bookings',
      'create:event-registration', 'read:my-events',
      'read:donations', 'update:donations',
      'read:bookings', 'update:bookings',
      'read:events', 'update:events', 'create:events',
      'read:announcements-all', 'create:announcements', 'update:announcements'
    ],
    isSystem: true
  },
  {
    name: 'Trustee',
    permissions: [
      'read:announcements', 'read:gallery', 'read:temple', 'create:contact',
      'read:donations', 'read:bookings', 'read:events', 'read:memberships',
      'read:volunteers', 'read:analytics', 'read:reports'
    ],
    isSystem: true
  },
  {
    name: 'Admin',
    permissions: [
      'read:announcements', 'read:gallery', 'read:temple', 'create:contact',
      'create:donation', 'read:my-donations',
      'create:booking', 'read:my-bookings',
      'create:event-registration', 'read:my-events',
      'read:donations', 'update:donations', 'create:donations',
      'read:bookings', 'update:bookings', 'create:bookings',
      'read:events', 'update:events', 'create:events', 'delete:events',
      'read:announcements-all', 'create:announcements', 'update:announcements', 'delete:announcements',
      'read:volunteers', 'update:volunteers',
      'read:memberships', 'update:memberships',
      'read:gallery-all', 'create:gallery', 'delete:gallery',
      'read:content', 'update:content',
      'read:analytics', 'read:reports'
    ],
    isSystem: true
  },
  {
    name: 'Super Admin',
    permissions: ['*'], // Universal permissions
    isSystem: true
  }
];

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/brahambaba';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for seeding...');

    // 1. Seed Roles
    console.log('Seeding roles...');
    await Role.deleteMany({});
    const createdRoles = await Role.insertMany(rolesData);
    console.log(`Seeded ${createdRoles.length} roles successfully.`);

    // Map names to IDs
    const rolesMap = {};
    createdRoles.forEach(r => {
      rolesMap[r.name] = r._id;
    });

    // 2. Seed Super Admin User
    console.log('Seeding Super Admin user...');
    await User.deleteMany({});
    const superAdminRole = rolesMap['Super Admin'];

    const superAdminUser = new User({
      name: 'BrahamBaba Super Admin',
      email: 'amankumar8084227421@gmail.com',
      password: 'superadmin123', // Pre-hashed by pre('save') middleware
      phone: '8084227421',
      role: superAdminRole,
      isVerified: true,
      status: 'active'
    });

    await superAdminUser.save();
    console.log('Seeded Super Admin user successfully.');

    // 3. Seed Temple Info (CMS Content)
    console.log('Seeding Temple Info CMS content...');
    await TempleInfo.deleteMany({});

    const defaultTempleInfo = new TempleInfo({
      history: 'BrahamBaba shrine stands as a testament to historical Vedic worship. Legend holds that the ancient sage Braham Baba meditated at this very spot under the old Banyan tree, consecrating the land with divine energies over five centuries ago. The local monarchs built a small stone shrine, which has now evolved into a magnificent temple complex.',
      significance: 'BrahamBaba is renowned as a temple of wish-fulfillment and spiritual solace. Devotees visit from across the nation to offer prayers, tie sacred threads for prosperity, and experience the immense silence that pervades the temple inner sanctum.',
      architecture: 'The temple complex is constructed using traditional Rajasthan pink sandstone, featuring intricate hand-carved pillars, a 108-foot high Shikhar (spire), and a large tranquil central courtyard. The Garbhagriha contains a marble murti of Braham Baba, flanked by carvings of Vedic deities.',
      founderDetails: 'Originally maintained by a line of resident sages, the temple management was formalized in 1978 under the BrahamBaba Devotee Trust, established by public spiritual leaders to expand social charity and facilitate devotee services.',
      mission: 'Our mission is to sustain spiritual worship, offer free meals (Annadanam) daily to all visitors, run community health camps, and preserve our ancient cultural heritage through education and spiritual discourses.',
      vision: 'To build a global spiritual and humanitarian center, ensuring that no visitor leaves hungry (Annadanam) and that all seekers find a peaceful environment to connect with their inner self.',
      trustInformation: 'The BrahamBaba Devotee Trust is governed by a board of 7 board trustees and registered under Section 12A/80G of the Income Tax Act, ensuring full tax rebate compliance for donations.',
      liveDarshanUrl: 'https://www.youtube.com/embed/live_stream?channel=UCxxxxxx', // Placeholder live stream
      address: 'BrahamBaba Temple Complex, Highway 2, Spiritual Valley, Pin - 302001',
      phone: '+91-9876543210',
      email: 'info@brahambaba.org',
      timings: [
        { activity: 'Temple Opening & Mangala Aarti', time: '05:30 AM' },
        { activity: 'Morning Darshan & Archana', time: '06:00 AM - 12:00 PM' },
        { activity: 'Mid-Day Bhog & Aarti (Temple Closes)', time: '12:15 PM' },
        { activity: 'Evening Temple Reopens', time: '04:30 PM' },
        { activity: 'Sandhya Aarti & Bhakti Bhajan', time: '06:30 PM' },
        { activity: 'Shayan Aarti (Temple Closes)', time: '08:30 PM' }
      ],
      trustees: [
        {
          name: 'Shri Ramachandra Shastri',
          role: 'Chief Patron / President',
          description: 'Spiritual scholar with 30+ years leading Vedic chanting and trust administration.',
          image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop'
        },
        {
          name: 'Smt. Lakshmi Devi Anandan',
          role: 'Managing Trustee',
          description: 'Former civil servant dedicated to scaling Annadanam kitchen and education initiatives.',
          image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop'
        }
      ]
    });

    await defaultTempleInfo.save();
    console.log('Seeded Temple CMS content successfully.');

    // 4. Seed Settings
    console.log('Seeding default system settings...');
    await Settings.deleteMany({});
    const defaultSettings = new Settings({
      smsNotificationEnabled: false,
      emailNotificationEnabled: true,
      whatsappNotificationEnabled: false,
      maintenanceMode: false,
      aiAssistantFallback: true,
      announcementAlert: 'Welcome to the BrahamBaba Temple Trust web portal. Book poojas and donate online securely.'
    });
    await defaultSettings.save();
    console.log('Seeded system settings successfully.');

    console.log('Database seeding completed successfully!');
    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();
