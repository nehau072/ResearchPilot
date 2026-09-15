export interface MarketDay {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
}



export const niftyData: MarketDay[] = [
  { date: "2024-01-02", open: 21751, high: 21834, low: 21680, close: 21742 },
  { date: "2024-01-03", open: 21720, high: 21790, low: 21550, close: 21583 },
  { date: "2024-01-04", open: 21610, high: 21700, low: 21580, close: 21658 },
  { date: "2024-01-05", open: 21700, high: 21800, low: 21620, close: 21765 },

  { date: "2024-01-08", open: 21780, high: 21900, low: 21700, close: 21830 },

  // Sharp fall: ~2.5%
  { date: "2024-01-09", open: 21820, high: 21850, low: 21200, close: 21285 },

  // Recovery after first sharp fall
  { date: "2024-01-10", open: 21300, high: 21600, low: 21250, close: 21550 },
  { date: "2024-01-11", open: 21570, high: 21800, low: 21500, close: 21780 },
  { date: "2024-01-12", open: 21800, high: 21950, low: 21650, close: 21920 },
  { date: "2024-01-15", open: 21900, high: 22020, low: 21750, close: 21880 },
  { date: "2024-01-16", open: 21860, high: 22000, low: 21800, close: 21950 },

  // Another sharp fall: ~3.2%
  { date: "2024-01-17", open: 21900, high: 21950, low: 21200, close: 21250 },

  // Mixed recovery
  { date: "2024-01-18", open: 21280, high: 21500, low: 21150, close: 21420 },
  { date: "2024-01-19", open: 21450, high: 21650, low: 21350, close: 21580 },
  { date: "2024-01-22", open: 21600, high: 21800, low: 21550, close: 21720 },
  { date: "2024-01-23", open: 21700, high: 21850, low: 21600, close: 21810 },
  { date: "2024-01-24", open: 21820, high: 21950, low: 21750, close: 21890 },

  // Another sharp fall: ~2.7%
  { date: "2024-01-25", open: 21850, high: 21900, low: 21200, close: 21280 },

  // Recovery
  { date: "2024-01-29", open: 21300, high: 21600, low: 21250, close: 21520 },
  { date: "2024-01-30", open: 21550, high: 21800, low: 21500, close: 21750 },
  { date: "2024-01-31", open: 21720, high: 21900, low: 21650, close: 21820 },
  { date: "2024-02-01", open: 21800, high: 22000, low: 21750, close: 21950 },
  { date: "2024-02-02", open: 21920, high: 22100, low: 21850, close: 22050 },

  // One more sharp fall
  { date: "2024-02-05", open: 22000, high: 22050, low: 21400, close: 21500 },

  { date: "2024-02-06", open: 21550, high: 21800, low: 21500, close: 21750 },
  { date: "2024-02-07", open: 21780, high: 22000, low: 21700, close: 21920 },
  { date: "2024-02-08", open: 21900, high: 22100, low: 21850, close: 22050 },
  { date: "2024-02-09", open: 22080, high: 22200, low: 22000, close: 22150 },
  { date: "2024-02-12", open: 22180, high: 22300, low: 22100, close: 22250 }
];