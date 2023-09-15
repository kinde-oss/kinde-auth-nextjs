const cookie = require('cookie');
import jwt_decode from 'jwt-decode';

export const setup = async (req, res) => {
  res.status(401).send({
    message: 'Unauthorized'
  });
};
