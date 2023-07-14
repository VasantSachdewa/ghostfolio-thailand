import { FinnomenaService } from '@ghostfolio/api/services/data-provider/finnomena/finnomena.service';

describe('FinnomenaService', () => {
  let finnomenaService: FinnomenaService;

  beforeEach(async () => {
    finnomenaService = new FinnomenaService();
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('test getHistorical should return correctly when data in range available ', async () => {
    finnomenaService['getFundIds'] = jest.fn().mockImplementation(() => {
      return ['irrelevant'];
    });
    finnomenaService['getAppropriateLookbackPeriod'] = jest.fn();
    finnomenaService['getNav'] = jest.fn().mockImplementation(() => {
      return {
        status: true,
        service_code: 'irrelevant',
        data: {
          fundId: 'irrelevant',
          shortCode: 'irrelevant',
          navs: [
            '2023-06-1T00:00:00Z2',
            '2023-06-13T00:00:00Z',
            '2023-06-14T00:00:00Z',
            '2023-06-15T00:00:00Z',
            '2023-06-16T00:00:00Z',
            '2023-06-17T00:00:00Z',
            '2023-06-18T00:00:00Z',
            '2023-06-19T00:00:00Z',
            '2023-06-20T00:00:00Z'
          ].map((date, i) => {
            return {
              date,
              value: 100 + i,
              amount: 100 * i
            };
          })
        }
      };
    });

    const result = await finnomenaService.getHistorical(
      'irrelevant',
      undefined,
      new Date('2023-06-15'),
      new Date('2023-06-18')
    );

    expect(result).toEqual({
      irrelevant: {
        '2023-06-15': {
          marketPrice: 103
        },
        '2023-06-16': {
          marketPrice: 104
        },
        '2023-06-17': {
          marketPrice: 105
        },
        '2023-06-18': {
          marketPrice: 106
        }
      }
    });
  });

  it('test getAppropriateLookbackPeriod should return 1W when from is 2023-06-12 and today is 2023-06-15', () => {
    const aFrom = new Date('2023-06-12');
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2023-06-15'));

    const result = finnomenaService['getAppropriateLookbackPeriod'](aFrom);
    expect(result).toEqual('1W');
  });

  it('test getAppropriateLookbackPeriod should return 1M when from is 2023-06-05 and today is 2023-06-15', () => {
    const aFrom = new Date('2023-06-05');
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2023-06-15'));

    const result = finnomenaService['getAppropriateLookbackPeriod'](aFrom);
    expect(result).toEqual('1M');
  });
});
