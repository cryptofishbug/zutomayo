export type MatchSource = 'manual' | 'auto' | 'fallback';

export interface Candidate {
  id: string;
  title: string;
  url: string;
  score: number;
}

export interface MatchInfo {
  source: MatchSource;
  confidence: number;
  reason: string;
  candidates: Candidate[];
}

export interface Variant {
  option: string;
  originalItemName?: string;
  csvPriceKrw: number;
  productId: string | null;
  url: string | null;
  title: string | null;
  titleKo: string | null;
  collection: string | null;
  collectionKo: string | null;
  priceJpy: string | null;
  images: string[];
  summary: string[];
  sizeLines: string[];
  modelLines: string[];
  materialLines: string[];
  country: string | null;
  match: MatchInfo;
}

export interface Item {
  category: string;
  name: string;
  variants: Variant[];
}

export interface GeneratedData {
  generatedAt: string;
  sourceCsv: string;
  site: string;
  stats: {
    items: number;
    variants: number;
    matched: number;
    manual: number;
    auto: number;
  };
  items: Item[];
}
