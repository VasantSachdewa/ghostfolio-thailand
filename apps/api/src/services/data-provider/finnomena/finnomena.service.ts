import { LookupItem } from '@ghostfolio/api/app/symbol/interfaces/lookup-item.interface';
import { DataProviderInterface } from '@ghostfolio/api/services/data-provider/interfaces/data-provider.interface';
import {
  FinnomenaSearchResponse,
  FundListResponse,
  FundNavResponse,
  NavLookbackRange
} from '@ghostfolio/api/services/data-provider/finnomena/finnomena.interface';
import {
  IDataProviderHistoricalResponse,
  IDataProviderResponse
} from '@ghostfolio/api/services/interfaces/interfaces';
import { Granularity } from '@ghostfolio/common/types';
import { DataProviderInfo } from '@ghostfolio/common/interfaces';
import {
  AssetClass,
  AssetSubClass,
  DataSource,
  SymbolProfile
} from '@prisma/client';

import { DATE_FORMAT } from '@ghostfolio/common/helper';
import { Logger } from '@nestjs/common';
import bent from 'bent';
import { format, isToday } from 'date-fns';

export class FinnomenaService implements DataProviderInterface {
  private currency = 'THB';
  private readonly URL = 'https://www.finnomena.com';

  public canHandle(symbol: string): boolean {
    return true;
  }

  // TODO add more data
  public async getAssetProfile(
    aSymbol: string
  ): Promise<Partial<SymbolProfile>> {
    return {
      dataSource: this.getName(),
      symbol: aSymbol,
      currency: this.currency
    };
  }

  public getName() {
    return DataSource.FINNOMENA;
  }

  public async getDividends({
    from,
    granularity = 'day',
    symbol,
    to
  }: {
    from: Date;
    granularity: Granularity;
    symbol: string;
    to: Date;
  }) {
    return {};
  }

  public async getHistorical(
    aSymbol: string,
    aGranularity: Granularity = 'day',
    from: Date,
    to: Date
  ): Promise<{
    [symbol: string]: { [date: string]: IDataProviderHistoricalResponse };
  }> {
    const result: {
      [symbol: string]: { [date: string]: IDataProviderHistoricalResponse };
    } = {};
    result[aSymbol] = {};
    const [fundId] = await this.getFundIds([aSymbol]);
    const lookbackRange = this.getAppropriateLookbackPeriod(from);
    const response = await this.getNav(fundId, lookbackRange);
    response.data.navs.forEach((nav) => {
      const navDate = new Date(nav.date);
      if (navDate >= from && navDate <= to) {
        result[aSymbol][format(navDate, DATE_FORMAT)] = {
          marketPrice: nav.value
        };
      }
    });
    if (Object.keys(result[aSymbol]).length === 0) {
      throw new Error(
        `Could not get historical market data for ${aSymbol} (${this.getName()}) from ${format(
          from,
          DATE_FORMAT
        )} to ${format(to, DATE_FORMAT)}: [Not Found] No Response from API`
      );
    }
    return result;
  }

  public async getQuotes(
    aSymbols: string[]
  ): Promise<{ [symbol: string]: IDataProviderResponse }> {
    const results: { [symbol: string]: IDataProviderResponse } = {};

    if (aSymbols.length === 0) {
      return Promise.resolve(results);
    }

    // TODO add support for non mutual-funds assets
    const fundIds = await this.getFundIds(aSymbols);
    for (const fundId of fundIds) {
      try {
        const response = await this.getNav(fundId);
        results[response.data.short_code] = {
          currency: this.currency,
          dataProviderInfo: this.getDataProviderInfo(),
          dataSource: this.getName(),
          marketPrice: response.data.navs[response.data.navs.length - 1].value,
          marketState: 'open'
        };
      } catch (error) {
        Logger.error(error, 'FinnomenaService');
        continue;
      }
    }
    return results;
  }

  public getTestSymbol() {
    return 'SCB';
  }

  public async search(aQuery: string): Promise<{ items: LookupItem[] }> {
    let items: LookupItem[] = [];
    try {
      const get = bent(
        `${this.URL}/fn4/public/api/v1/global/_search?q=${aQuery}&size=10&category=asset,knowledge&lang=en`,
        'GET',
        'json',
        200
      );
      const resp: FinnomenaSearchResponse = await get();
      // TODO verify format data correct using something similar to pydantic
      // TODO add support for non mutual-funds assets
      items = resp.data.result.asset
        .filter((asset) => asset.type_en == 'fund')
        .map((asset) => {
          return {
            name: asset.description,
            symbol: asset.title,
            assetClass: this.getAssetClass(asset.category_en),
            assetSubClass: this.getAssetSubClass(asset.type_en),
            currency: this.currency,
            dataSource: this.getName()
          };
        });
    } catch (error) {
      Logger.error(error, 'FinnomenaService');
    }

    return { items };
  }

  private getAppropriateLookbackPeriod(aFrom: Date): NavLookbackRange {
    const oneDay = 24 * 60 * 60 * 1000;

    const today = new Date();
    const timeDiff = today.getTime() - aFrom.getTime();
    if (timeDiff <= oneDay) {
      return NavLookbackRange.OneDay;
    } else if (timeDiff <= oneDay * 7) {
      return NavLookbackRange.OneWeek;
    } else if (timeDiff <= oneDay * 30) {
      return NavLookbackRange.OneMonth;
    } else if (timeDiff <= oneDay * 90) {
      return NavLookbackRange.ThreeMonths;
    } else if (timeDiff <= oneDay * 180) {
      return NavLookbackRange.SixMonths;
    } else if (timeDiff <= oneDay * 365) {
      return NavLookbackRange.OneYear;
    } else if (timeDiff <= oneDay * 365 * 3) {
      return NavLookbackRange.ThreeYears;
    } else if (timeDiff <= oneDay * 365 * 5) {
      return NavLookbackRange.FiveYears;
    } else if (timeDiff <= oneDay * 365 * 10) {
      return NavLookbackRange.TenYears;
    } else {
      return NavLookbackRange.TenYears;
    }
  }

  private getDataProviderInfo(): DataProviderInfo {
    return {
      name: this.getName(),
      url: this.URL
    };
  }

  private async getFundIds(aSymbols: string[]): Promise<string[]> {
    // TODO implement cache in memory
    const fundList = await this.getAllFundList();
    const fundIds = fundList.data
      .filter((fund) => aSymbols.includes(fund.short_code))
      .map((fund) => fund.fund_id);
    return fundIds;
  }

  private async getNav(
    aFundId: string,
    range: NavLookbackRange = NavLookbackRange.OneDay
  ) {
    try {
      const get = bent(
        `${this.URL}/fn3/api/fund/v2/public/funds/${aFundId}/nav/q?range=${range}`,
        'GET',
        'json',
        200
      );
      const resp: FundNavResponse = await get();
      return resp;
    } catch (error) {
      Logger.error(error, 'FinnomenaService');
    }
  }

  private async getAllFundList(): Promise<FundListResponse> {
    try {
      const get = bent(
        `${this.URL}/fn3/api/fund/v2/public/funds`,
        'GET',
        'json',
        200
      );
      const resp: FundListResponse = await get();
      return resp;
    } catch (error) {
      Logger.error(error, 'FinnomenaService');
    }
  }

  private getAssetClass(aCategory: string): AssetClass {
    if (aCategory != 'asset') {
      Logger.warn(`Unknown assetClass: ${aCategory}`, 'FinnomenaService');
    }
    return AssetClass.EQUITY;
  }

  private getAssetSubClass(aSubCategory: string): AssetSubClass {
    if (!['fund'].includes(aSubCategory)) {
      Logger.warn(`Unknown assetSubClass: ${aSubCategory}`, 'FinnomenaService');
    }
    return AssetSubClass.MUTUALFUND;
  }
}
