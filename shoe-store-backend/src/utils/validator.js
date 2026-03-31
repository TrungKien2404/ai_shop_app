const validator = require('validator');

// Validate signup data
exports.validateSignup = (fullname, email, password, confirmPassword) => {
  const errors = [];

  // Validate fullname
  if (!fullname || fullname.trim().length === 0) {
    errors.push('Full name is required');
  } else if (fullname.length < 3) {
    errors.push('Full name must be at least 3 characters');
  }

  // Validate email
  if (!email || !validator.isEmail(email)) {
    errors.push('Valid email is required');
  }

  // Validate password
  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }

  // Validate confirm password
  if (password !== confirmPassword) {
    errors.push('Passwords do not match');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validate login data
exports.validateLogin = (email, password) => {
  const errors = [];

  if (!email || !validator.isEmail(email)) {
    errors.push('Valid email is required');
  }

  if (!password || password.length === 0) {
    errors.push('Password is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
