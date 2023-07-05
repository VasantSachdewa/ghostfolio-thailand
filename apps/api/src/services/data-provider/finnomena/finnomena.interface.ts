// -- Finnomena Search Response --

export interface FinnomenaSearchResponse {
  status: boolean;
  service_code: string;
  data: Data;
}

export interface Data {
  result: Result;
}

export interface Result {
  asset: Asset[];
  knowledge: Knowledge[];
}

export interface Asset {
  id: string;
  title: string;
  description: string;
  meta: AssetMeta;
  url: string;
  category_th: string;
  category_en: string;
  type_th: string;
  type_en: string;
  score: string;
}

export interface AssetMeta {
  active: boolean;
  is_finnomena_pick: boolean;
  promotions: string[];
}

export interface Knowledge {
  id: string;
  title: string;
  description: string;
  meta: KnowledgeMeta;
  url: string;
  category_th: string;
  category_en: string;
  type_th: string;
  type_en: string;
  score: string;
}

export interface KnowledgeMeta {
  author: string;
  author_url: string;
  image: string;
  main_category: string;
  main_category_url: string;
  premium: boolean;
  published_at: string;
}

// --- Finnomena Fund List Response ---
export interface FundListResponse {
  status: boolean;
  service_code: string;
  data: Datum[];
}

export interface Datum {
  fund_id: string;
  short_code: string;
  name_th: null | string;
  aimc_category_id: AimcCategoryID | null;
  short_desc: null | string;
  is_finnomena_pick: boolean;
  is_in_trending: boolean;
  sec_is_active: boolean;
  promotions: Promotion[];
}

export enum AimcCategoryID {
  Lc00002468 = 'LC00002468',
  Lc00002469 = 'LC00002469',
  Lc00002470 = 'LC00002470',
  Lc00002471 = 'LC00002471',
  Lc00002472 = 'LC00002472',
  Lc00002473 = 'LC00002473',
  Lc00002474 = 'LC00002474',
  Lc00002475 = 'LC00002475',
  Lc00002476 = 'LC00002476',
  Lc00002477 = 'LC00002477',
  Lc00002478 = 'LC00002478',
  Lc00002479 = 'LC00002479',
  Lc00002480 = 'LC00002480',
  Lc00002481 = 'LC00002481',
  Lc00002482 = 'LC00002482',
  Lc00002483 = 'LC00002483',
  Lc00002485 = 'LC00002485',
  Lc00002486 = 'LC00002486',
  Lc00002487 = 'LC00002487',
  Lc00002488 = 'LC00002488',
  Lc00002489 = 'LC00002489',
  Lc00002490 = 'LC00002490',
  Lc00002491 = 'LC00002491',
  Lc00002494 = 'LC00002494',
  Lc00002496 = 'LC00002496',
  Lc00002497 = 'LC00002497',
  Lc00002499 = 'LC00002499',
  Lc00002633 = 'LC00002633',
  Lc00002634 = 'LC00002634',
  Lc00002635 = 'LC00002635',
  Lc00002658 = 'LC00002658',
  Lc00002659 = 'LC00002659',
  Lc00002660 = 'LC00002660',
  Lc00002688 = 'LC00002688',
  Lc00002689 = 'LC00002689',
  Lc00002703 = 'LC00002703',
  Lc00002704 = 'LC00002704',
  Lc00002858 = 'LC00002858'
}

export interface Promotion {
  campaign: Campaign;
  title: Title;
  description: Description;
  type: Type;
  url: string;
}

export enum Campaign {
  Fint = 'fint',
  FintCashback = 'fint-cashback'
}

export enum Description {
  รับ1Fintทุกการลงทุน5000 = 'รับ 1 FINT ทุกการลงทุน 5,000 ฿',
  ใช้Fintลดค่าธรรมเนียมซื้อกองทุน = 'ใช้ FINT ลดค่าธรรมเนียมซื้อกองทุน'
}

export enum Title {
  Cashback = 'Cashback',
  Earn = 'Earn'
}

export enum Type {
  FintCashback = 'fint-cashback',
  FintWallet = 'fint-wallet'
}

// --- Finnomena Fund NAV Response ---

export enum NavLookbackRange {
  OneDay = '1D',
  OneWeek = '1W',
  OneMonth = '1M',
  ThreeMonths = '3M',
  SixMonths = '6M',
  OneYear = '1Y',
  ThreeYears = '3Y',
  FiveYears = '5Y',
  TenYears = '10Y'
}

export interface FundNavResponse {
  status: boolean;
  service_code: string;
  data: FundNav;
}

export interface FundNav {
  fund_id: string;
  short_code: string;
  navs: Nav[];
}

export interface Nav {
  date: string;
  value: number;
  amount: number;
}
