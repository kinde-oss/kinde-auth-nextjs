import {getUser} from './getUser';

const isAuthenticated = async () => Boolean(await getUser());

export {isAuthenticated};
