import { Beach, BeachPosition } from '@src/models/beach';
import { User } from '@src/models/user';
import { AuthService } from '@src/services/auth';

describe('Beaches functional tests', () => {
  const defaultUser = {
    name: 'John Doe',
    email: 'john@email.com',
    password: '12345',
  };

  let token: string;

  beforeEach(async () => {
    await Beach.deleteMany({});
    await User.deleteMany({});
    const user = await new User(defaultUser).save();
    token = AuthService.generateToken(user.toJSON());
  });

  afterAll(async () => {
    await Beach.deleteMany({});
    await User.deleteMany({});
  });

  const makeResponse = (beach: object, newToken: string) => {
    return global.testRequest
      .post('/beaches')
      .set({ 'x-access-token': newToken })
      .send(beach);
  };

  describe('When creating a beach', () => {
    it('Should create a beach with success', async () => {
      const newBeach = {
        lat: -33.792726,
        lng: 151.289824,
        name: 'Manly',
        position: BeachPosition.E,
      };

      const response = await makeResponse(newBeach, token);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(expect.objectContaining(newBeach));
    });

    it('Should return 422 when there is a validation error', async () => {
      const newBeach = {
        lat: 'invalid_string',
        lng: 151.289824,
        name: 'Manly',
        position: BeachPosition.E,
      };

      const response = await makeResponse(newBeach, token);

      expect(response.status).toBe(422);
      expect(response.body).toEqual({
        code: 422,
        error: 'Unprocessable Entity',
        message:
          'Beach validation failed: lat: Cast to Number failed for value "invalid_string" (type string) at path "lat"',
      });
    });

    it('Should return 500 when there is any error other than validation error', async () => {
      jest
        .spyOn(Beach.prototype, 'save')
        .mockImplementationOnce(() => Promise.reject());

      const newBeach = {
        lat: 'invalid_string',
        lng: 151.289824,
        name: 'Manly',
        position: BeachPosition.E,
      };

      const response = await makeResponse(newBeach, token);

      expect(response.status).toBe(500);
    });
  });
});
