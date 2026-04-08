const mongoose = require('mongoose');
const User = require('./models/User');
const config = require('./config/env');

const check = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log("Connected to DB");
    
    const admin = await User.findOne({ email: 'admin@gmail.com' });
    if (!admin) {
      console.log("Admin user not found in DB");
    } else {
      console.log("Admin found!");
      console.log("IsAdmin:", admin.isAdmin);
      console.log("Raw Password in DB:", admin.password);
      if (admin.password.startsWith('$2')) {
          console.log("Password seems hashed correctly.");
      } else {
          console.log("ALERT: Password is PLAIN TEXT in DB! This is why login fails.");
      }
    }
    process.exit();
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};

check();
