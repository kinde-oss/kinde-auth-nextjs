import {generateAuthUrlParams} from '../../src/utils/generateAuthUrlParams'; // Assuming the function is exported from this file
import {expect, test, describe} from 'vitest';
import { trimTrailingSlash } from '../../src/utils/trimTrailingSlash'

describe('generateAuthUrlParams', () => {
  test('should generate correct url parameters', () => {
    const orgCode = 'testOrgCode';
    const postLoginRedirectURL = 'http://localhost';
    const authUrlParams = {
      response_type: 'code',
      scope: 'openid profile email'
    };
    const result = generateAuthUrlParams(
      orgCode,
      postLoginRedirectURL,
      authUrlParams
    );
    expect(result.toString()).toBe(
      'response_type=code&scope=openid+profile+email&org_code=testOrgCode&post_login_redirect_url=http%3A%2F%2Flocalhost'
    );
  });

  test('should handle null orgCode and postLoginRedirectURL', () => {
    const orgCode = null;
    const postLoginRedirectURL = null;
    const authUrlParams = {
      response_type: 'code',
      scope: 'openid profile email'
    };
    const result = generateAuthUrlParams(
      orgCode,
      postLoginRedirectURL,
      authUrlParams
    );
    expect(result.toString()).toBe(
      'response_type=code&scope=openid+profile+email'
    );
  });

  test('should handle empty authUrlParams', () => {
    const orgCode = 'testOrgCode';
    const postLoginRedirectURL = 'http://localhost';
    const authUrlParams = {};
    const result = generateAuthUrlParams(
      orgCode,
      postLoginRedirectURL,
      authUrlParams
    );
    expect(result.toString()).toBe(
      'org_code=testOrgCode&post_login_redirect_url=http%3A%2F%2Flocalhost'
    );
  });
});


describe('trimTrailingSlash', () => {
  test ('slashes are trimmed', () => {
    expect(trimTrailingSlash('test/')).toEqual('test')
  })

  test ('leave alone if no trailing', () => {
    expect(trimTrailingSlash('test')).toEqual('test')
  })
})
