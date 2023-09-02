import {config} from '../../config/index';
import {setupChallenge} from '../setupChallenge';
import {setVerifierCookie} from './setVerifierCookie';
import {generateAuthUrl} from '../generateAuthUrl';

export const prepareForRedirect = (options, type = 'login', res) => {
  const {code_challenge, code_verifier, state} = setupChallenge();
  setVerifierCookie(state, code_verifier, res, options);
  options.state = state;
  options.code_challenge = code_challenge;

  return generateAuthUrl(options, type).href;
};
