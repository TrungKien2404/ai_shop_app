const { dbAsync } = require('../config/database');
const bcrypt = require('bcryptjs');

// Create user
const createUser = async (userData) => {
  const { fullname, email, password, phone, address, avatar } = userData;
  
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const result = await dbAsync.run(
    `INSERT INTO users (fullname, email, password, phone, address, avatar) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [fullname, email, hashedPassword, phone || null, address || null, avatar || null]
  );
  
  return result;
};

// Find user by email
const findUserByEmail = async (email) => {
  return await dbAsync.get(
    `SELECT * FROM users WHERE email = ?`,
    [email]
  );
};

// Find user by ID
const findUserById = async (id) => {
  return await dbAsync.get(
    `SELECT id, fullname, email, phone, address, avatar, createdAt, updatedAt 
     FROM users WHERE id = ?`,
    [id]
  );
};

// Get user by ID with password
const findUserByIdWithPassword = async (id) => {
  return await dbAsync.get(
    `SELECT * FROM users WHERE id = ?`,
    [id]
  );
};

// Update user
const updateUser = async (id, updates) => {
  const { fullname, phone, address, avatar } = updates;
  
  const result = await dbAsync.run(
    `UPDATE users 
     SET fullname = COALESCE(?, fullname), 
         phone = COALESCE(?, phone), 
         address = COALESCE(?, address),
         avatar = COALESCE(?, avatar),
         updatedAt = CURRENT_TIMESTAMP 
     WHERE id = ?`,
    [fullname, phone, address, avatar, id]
  );
  
  return result;
};

// Compare password
const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  findUserByIdWithPassword,
  updateUser,
  comparePassword
};
