const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const fixAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB...");
    
    // Tìm user admin
    let admin = await User.findOne({ email: 'admin@gmail.com' });

    if (admin) {
      console.log("Updating existing admin user...");
      // IMPORTANT: User model has a pre-save hook that hashes password.
      // Set plain password here to avoid double-hashing.
      admin.password = '123456';
      admin.isAdmin = true;
      await admin.save();
    } else {
      console.log("Creating new admin user...");
      await User.create({
        name: 'Admin',
        email: 'admin@gmail.com',
        password: '123456', // User.create will trigger the pre-save hash hook
        isAdmin: true
      });
    }

    console.log("✅ FIX THÀNH CÔNG!");
    console.log("Email: admin@gmail.com");
    console.log("Password: 123456");
    console.log("isAdmin: true");
    
    process.exit();
  } catch (e) {
    console.error("Lỗi:", e);
    process.exit(1);
  }
};

fixAdmin();
