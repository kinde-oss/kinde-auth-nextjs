import {removeTrailingSlash} from '../../src/utils/removeTrailingSlash'; // Assuming the function is exported from utils file
import {generateUserObject} from '../../src/utils/generateUserObject'; // Assuming the function is exported from utils file

describe('removeTrailingSlash', () => {
  test('should remove trailing slash', () => {
    const url = 'http://example.com/';
    expect(removeTrailingSlash(url)).toBe('http://example.com');
  });

  test('should trim whitespace', () => {
    const url = ' http://example.com/ ';
    expect(removeTrailingSlash(url)).toBe('http://example.com');
  });

  test('should handle url without trailing slash', () => {
    const url = 'http://example.com';
    expect(removeTrailingSlash(url)).toBe('http://example.com');
  });

  test('should handle empty string', () => {
    const url = '';
    expect(removeTrailingSlash(url)).toBe('');
  });
});

describe('generateUserObject', () => {
  const user = {
    id: 'kp:123',
    email: 'john@doe.com',
    given_name: 'John',
    family_name: 'Doe',
    picture: 'http://example.com/avatar.jpg'
  };
  const userProperties = {
    custom_prop: {
      v: 'hello world'
    },
    kp_usr_city: {
      v: 'Sydney'
    },
    kp_usr_industry: {
      v: 'Software'
    },
    kp_usr_job_title: {
      v: 'Engineer'
    },
    kp_usr_middle_name: {
      v: 'Sabichay'
    },
    kp_usr_postcode: {},
    kp_usr_salutation: {},
    kp_usr_state_region: {},
    kp_usr_street_address: {},
    kp_usr_street_address_2: {},
    test: {
      v: 'fafdsafdsa'
    }
  };
  const phone_number = '1234567890';
  const username = 'john.doe';
  test('should generate user object', () => {
    expect(
      generateUserObject(user, userProperties, phone_number, username)
    ).toEqual({
      id: 'kp:123',
      email: 'john@doe.com',
      given_name: 'John',
      family_name: 'Doe',
      picture: 'http://example.com/avatar.jpg',
      phone_number: '1234567890',
      username: 'john.doe',
      properties: {
        custom_prop: 'hello world',
        city: 'Sydney',
        industry: 'Software',
        job_title: 'Engineer',
        middle_name: 'Sabichay',
        postcode: undefined,
        salutation: undefined,
        state_region: undefined,
        street_address: undefined,
        street_address_2: undefined,
        test: 'fafdsafdsa'
      }
    });
  });

  test('should handle userProperties undefined', () => {
    expect(generateUserObject(user, undefined, phone_number, username)).toEqual(
      {
        email: 'john@doe.com',
        family_name: 'Doe',
        given_name: 'John',
        id: 'kp:123',
        phone_number: '1234567890',
        picture: 'http://example.com/avatar.jpg',
        username: 'john.doe'
      }
    );
  });

  test('should handle phone_number undefined', () => {
    expect(generateUserObject(user, undefined, undefined, username)).toEqual({
      email: 'john@doe.com',
      family_name: 'Doe',
      given_name: 'John',
      id: 'kp:123',
      phone_number: undefined,
      picture: 'http://example.com/avatar.jpg',
      username: 'john.doe'
    });
  });

  test('should handle username undefined', () => {
    expect(generateUserObject(user, undefined, undefined, undefined)).toEqual({
      email: 'john@doe.com',
      family_name: 'Doe',
      given_name: 'John',
      id: 'kp:123',
      phone_number: undefined,
      picture: 'http://example.com/avatar.jpg',
      username: undefined
    });
  });
});
