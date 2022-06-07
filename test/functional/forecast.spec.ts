import nock from 'nock';
import { Beach, BeachPosition } from '@src/models/beach';
import { User } from '@src/models/user';
import stormGlassWeather3HoursFixture from '@test/fixtures/stormglass_weather_3_hours.json';
import apiForecastResponse1BeachFixture from '../fixtures/api_forecast_response_1_beach.json';
import { AuthService } from '@src/services/auth';
describe('Beach forecast functional tests', () => {
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

    const defaultBeach = {
      lat: -33.792726,
      lng: 151.289824,
      name: 'Manly',
      position: BeachPosition.E,
      user: user.id,
    };

    await new Beach(defaultBeach).save();
    token = AuthService.generateToken(user.toJSON());
  });

  const makeResponse = (newToken: string) => {
    return global.testRequest
      .get('/forecast')
      .set({ 'x-access-token': newToken });
  };

  it('Should return a forecast with just a few times', async () => {
    nock('https://api.stormglass.io:443', {
      encodedQueryParams: true,
      reqheaders: {
        Authorization: (): boolean => true,
      },
    })
      .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
      .get('/v2/weather/point')
      .query({
        source: 'noaa',
        lat: '-33.792726',
        params: /(.*)/,
        lng: '151.289824',
      })
      .reply(200, stormGlassWeather3HoursFixture);

    const { body, status } = await makeResponse(token);
    expect(status).toBe(200);
    expect(body).toEqual(apiForecastResponse1BeachFixture);
  });

  it('Should return 500 if something goes wrong during the processing', async () => {
    nock('https://api.stormglass.io:443', {
      encodedQueryParams: true,
      reqheaders: {
        Authorization: (): boolean => true,
      },
    })
      .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
      .get('/v1/weather/point')
      .query({ lat: '-33.792726', lng: '151.289824' })
      .replyWithError('Something went wrong');

    const { status } = await makeResponse(token);

    expect(status).toBe(500);
  });
});
