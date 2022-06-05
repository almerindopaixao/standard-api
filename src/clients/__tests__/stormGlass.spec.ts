import { StormGlass } from '@src/clients/stormGlass';
import stormGlassWeather3HoursFixture from '@test/fixtures/stormglass_weather_3_hours.json';
import stormGlassNormalized3HoursFixture from '@test/fixtures/stormglass_normalized_response_3_hours.json';
import axios, { AxiosStatic } from 'axios';

jest.mock('axios');

describe('StormGlass client', () => {
  const mockedAxios = axios as jest.Mocked<AxiosStatic>;

  const makeResolvedSut = (response: unknown): StormGlass => {
    mockedAxios.get.mockResolvedValue({ data: response });
    return new StormGlass(mockedAxios);
  };

  const makeRejectedSut = (error: unknown): StormGlass => {
    mockedAxios.get.mockRejectedValue(error);
    return new StormGlass(mockedAxios);
  };

  it('Should return the normalized forecast from the StormGlass service', async () => {
    const lat = -33.792726;
    const lng = 151.289824;

    const sut = makeResolvedSut(stormGlassWeather3HoursFixture);
    const response = await sut.fetchPoints(lat, lng);

    expect(response).toEqual(stormGlassNormalized3HoursFixture);
  });

  it('Should exclude incomplete data points', async () => {
    const lat = -33.792726;
    const lng = 151.289824;
    const incompleteResponse = {
      hours: [
        {
          windDirection: {
            noaa: 300,
          },
          time: '2020-04-26T00:00:00+00:00',
        },
      ],
    };

    const sut = makeResolvedSut(incompleteResponse);
    const response = await sut.fetchPoints(lat, lng);

    expect(response).toEqual([]);
  });

  it('Should get a generic error from StormGlass service when the request fail before reaching the service', async () => {
    const lat = -33.792726;
    const lng = 151.289824;

    const sut = makeRejectedSut({ message: 'Network Error' });

    await expect(sut.fetchPoints(lat, lng)).rejects.toThrow(
      'Unexpected error when trying to communicate to StormGlass: Network Error'
    );
  });

  it('Should get an StormGlassResponseError when the StormGlass service responds with error', async () => {
    const lat = -33.792726;
    const lng = 151.289824;

    const sut = makeRejectedSut({
      response: {
        status: 429,
        data: { errors: ['Rate Limit reached'] },
      },
    });

    await expect(sut.fetchPoints(lat, lng)).rejects.toThrow(
      'Unexpected error returned by the StormGlass service: Error: {"errors":["Rate Limit reached"]} Code: 429'
    );
  });
});
