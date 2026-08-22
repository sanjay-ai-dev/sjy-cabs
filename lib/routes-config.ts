export interface RouteConfig {
  id: string;
  fromCity: string;
  toCity: string;
  landmarkFrom: string;
  landmarkTo: string;
  distanceKm: number;
  durationMins: number;
  fareRegular: number;
  fareOriginal: number;
  passOfferPrice: number | null;
  passNormalPrice: number | null;
  passRidesCount: number;
  status: 'active' | 'coming_soon';
  activeErtigasCount: number;
  dailySchedulesCount: number;
}

export const ROUTES_CONFIG: Record<string, RouteConfig> = {
  'IND-DHR': {
    id: 'IND-DHR',
    fromCity: 'Indore',
    toCity: 'Dhar',
    landmarkFrom: 'Rajwada / Vijay Nagar',
    landmarkTo: 'Ahilya Fort / Bus Stand',
    distanceKm: 62,
    durationMins: 90,
    fareRegular: 250,
    fareOriginal: 350,
    passOfferPrice: 9999,
    passNormalPrice: 18000,
    passRidesCount: 50,
    status: 'active',
    activeErtigasCount: 2,
    dailySchedulesCount: 6
  },
  'DHR-IND': {
    id: 'DHR-IND',
    fromCity: 'Dhar',
    toCity: 'Indore',
    landmarkFrom: 'Ahilya Fort / Bus Stand',
    landmarkTo: 'Rajwada / Vijay Nagar',
    distanceKm: 62,
    durationMins: 90,
    fareRegular: 250,
    fareOriginal: 350,
    passOfferPrice: 9999,
    passNormalPrice: 18000,
    passRidesCount: 50,
    status: 'active',
    activeErtigasCount: 2,
    dailySchedulesCount: 6
  },
  'IND-UJJ': {
    id: 'IND-UJJ',
    fromCity: 'Indore',
    toCity: 'Ujjain',
    landmarkFrom: 'Vijay Nagar / Railway Station',
    landmarkTo: 'Mahakal Temple / Nanakheda',
    distanceKm: 55,
    durationMins: 75,
    fareRegular: 180,
    fareOriginal: 250,
    passOfferPrice: 7500,
    passNormalPrice: 14000,
    passRidesCount: 50,
    status: 'coming_soon',
    activeErtigasCount: 0,
    dailySchedulesCount: 0
  },
  'IND-DEW': {
    id: 'IND-DEW',
    fromCity: 'Indore',
    toCity: 'Dewas',
    landmarkFrom: 'Radisson Square / Bypass',
    landmarkTo: 'Tekri Mata / Bus Stand',
    distanceKm: 35,
    durationMins: 50,
    fareRegular: 160,
    fareOriginal: 220,
    passOfferPrice: 7000,
    passNormalPrice: 12000,
    passRidesCount: 50,
    status: 'coming_soon',
    activeErtigasCount: 0,
    dailySchedulesCount: 0
  }
};

export const DAILY_SCHEDULE_SLOTS = [
  { id: 'S1', time: '07:00 AM', route: 'IND ➔ DHR', ertiga: 'MP09 AB 1001', seatsLeft: 4 },
  { id: 'S2', time: '08:00 AM', route: 'DHR ➔ IND', ertiga: 'MP09 AB 1002', seatsLeft: 2 },
  { id: 'S3', time: '09:30 AM', route: 'IND ➔ DHR', ertiga: 'MP09 AB 1001', seatsLeft: 5 },
  { id: 'S4', time: '11:00 AM', route: 'DHR ➔ IND', ertiga: 'MP09 AB 1002', seatsLeft: 6 },
  { id: 'S5', time: '04:00 PM', route: 'IND ➔ DHR', ertiga: 'MP09 AB 1001', seatsLeft: 3 },
  { id: 'S6', time: '06:00 PM', route: 'DHR ➔ IND', ertiga: 'MP09 AB 1002', seatsLeft: 4 }
];
