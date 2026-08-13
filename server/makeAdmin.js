import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

// Create schema reference for Role
const roleSchema = new mongoose.Schema({ name: String });
const Role = mongoose.models.Role || mongoose.model('Role', roleSchema);

const makeAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        // Find the Admin role
        const adminRole = await Role.findOne({ name: 'Admin' });
        if (!adminRole) {
            console.log('Admin role not found!');
            return;
        }

        const user = await User.findOneAndUpdate(
            { email: 'admin3@test.com' },
            { role: adminRole._id },
            { new: true }
        );
        console.log('Updated user:', user ? user.email : 'not found');
    } catch (err) {
        console.error(err);
    } finally {
        mongoose.disconnect();
    }
};

makeAdmin();
