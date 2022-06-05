import * as HTTPService from '@src/services/request';
import { StormGlass } from '@src/clients/stormGlass';
import stormGlassWeather3HoursFixture from '@test/fixtures/stormglass_weather_3_hours.json';
import stormGlassNormalized3HoursFixture from '@test/fixtures/stormglass_normalized_response_3_hours.json';

jest.mock('@src/services/request');

describe('StormGlass client', () => {
  const MockedRequestClass = HTTPService.Request as jest.Mocked<
    typeof HTTPService.Request
  >;
  const mockedRequest =
    new HTTPService.Request() as jest.Mocked<HTTPService.Request>;

  const makeResolvedSut = (response: unknown): StormGlass => {
    mockedRequest.get.mockResolvedValue({
      data: response,
    } as HTTPService.Response);
    return new StormGlass(mockedRequest);
  };

  const makeRejectedSut = (error: unknown): StormGlass => {
    mockedRequest.get.mockRejectedValue(error);
    return new StormGlass(mockedRequest);
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

    MockedRequestClass.isRequestError.mockReturnValue(true);
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
