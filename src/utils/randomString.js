const crypto = require('crypto');

export const randomString = () => crypto.randomBytes(28).toString('hex');
