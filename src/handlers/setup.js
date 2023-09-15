const cookie = require('cookie');
import jwt_decode from 'jwt-decode';

export const setup = async (routerClient) => {
  routerClient.json({message: 'sup'});
  // res.status(401).send({

  //   message: 'Unauthorized'
  // });
};
