export interface CarpoolBooking {
  id: string;
  userName: string;
  userPhone: string;
  bookedAt: string;
  isWaitlist: boolean;
  waitlistNumber?: number;
}

/**
 * What the poster is driving. Drives which pooling mode a post can satisfy on
 * the /pool surface: CAR → Carpool, BIKE → Bikepool, TAXI → Taxipool.
 * Optional because it postdates the original community feed — posts without it
 * are treated as CAR, which is what every pre-existing post was.
 */
export type PoolVehicleType = 'CAR' | 'BIKE' | 'TAXI';

export interface CarpoolPost {
  id: string;
  type: 'OFFER' | 'SEEK' | 'CAB_POOL'; // #OfferRide | #SeekRide | Cab Pool
  posterRole: 'CAR_OWNER' | 'PASSENGER' | 'COMMUTER_GROUP';
  vehicleType?: PoolVehicleType;
  driverName: string;
  driverGender: 'male' | 'female';
  phone: string;
  routeFrom: string;
  routeTo: string;
  departureDate: string; // ISO date string (YYYY-MM-DD) or 'Daily'
  departureTime: string; // e.g., '08:30 AM'
  returnTime?: string; // e.g., '06:00 PM'
  totalSeats: number;
  availableSeats: number;
  bookings: CarpoolBooking[];
  isFullyBooked: boolean;
  vehicleModel?: string; // e.g., 'Swift Dzire', 'WagonR', 'Ertiga AC'
  vehicleNumber?: string; // e.g., 'MP-11-CA-1234'
  fuelShare?: string; // e.g., '₹150/seat' or 'Free' or 'Split Fuel'
  isFemaleOnly: boolean; // Female safe environment flag
  row1FemalePriority?: boolean;
  liveGpsEnabled: boolean;
  notes?: string;
  createdAt: string;
}

// Initial realistic seed data for Dhar ↔ Indore and pre-planned trips
export const initialCarpoolPosts: CarpoolPost[] = [
  {
    id: 'pool-101',
    type: 'OFFER',
    posterRole: 'CAR_OWNER',
    vehicleType: 'CAR',
    driverName: 'Rajesh Sharma',
    driverGender: 'male',
    phone: '8109745019',
    routeFrom: 'Dhar LIG Colony / Trimurti Nagar',
    routeTo: 'Indore Vijay Nagar (IT Park)',
    departureDate: 'Daily (Mon-Sat)',
    departureTime: '08:30 AM',
    returnTime: '06:30 PM',
    totalSeats: 3,
    availableSeats: 2,
    bookings: [
      {
        id: 'b-1',
        userName: 'Aman Verma',
        userPhone: '98260XXXXX',
        bookedAt: new Date().toISOString(),
        isWaitlist: false,
      },
    ],
    isFullyBooked: false,
    vehicleModel: 'Maruti Suzuki Swift Dzire AC',
    vehicleNumber: 'MP-11-ZC-4512',
    fuelShare: '₹150 / seat (Fuel Split)',
    isFemaleOnly: false,
    liveGpsEnabled: true,
    notes: 'Daily office commuter trip. Clean AC car, non-smoker, quiet ride.',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'pool-102',
    type: 'OFFER',
    posterRole: 'CAR_OWNER',
    vehicleType: 'CAR',
    driverName: 'Priya Joshi',
    driverGender: 'female',
    phone: '9893012345',
    routeFrom: 'Dhar Mohan Talkies Square',
    routeTo: 'Indore Bhawarkua / Geeta Bhawan',
    departureDate: 'Daily (Mon-Fri)',
    departureTime: '08:45 AM',
    returnTime: '05:30 PM',
    totalSeats: 3,
    availableSeats: 0,
    bookings: [
      { id: 'b-2', userName: 'Neha Gupta', userPhone: '94250XXXXX', bookedAt: new Date().toISOString(), isWaitlist: false },
      { id: 'b-3', userName: 'Pooja Jain', userPhone: '98931XXXXX', bookedAt: new Date().toISOString(), isWaitlist: false },
      { id: 'b-4', userName: 'Anjali Sharma', userPhone: '91790XXXXX', bookedAt: new Date().toISOString(), isWaitlist: false },
      { id: 'b-5', userName: 'Ritu Singh', userPhone: '88710XXXXX', bookedAt: new Date().toISOString(), isWaitlist: true, waitlistNumber: 1 },
    ],
    isFullyBooked: true,
    vehicleModel: 'Tata Punch iCNG AC',
    fuelShare: '₹140 / seat',
    isFemaleOnly: true,
    liveGpsEnabled: true,
    notes: '🚺 FEMALE ONLY RIDE. Safe, verified commute for college/coaching students.',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'pool-103',
    type: 'OFFER',
    posterRole: 'CAR_OWNER',
    vehicleType: 'CAR',
    driverName: 'Vikram Singh',
    driverGender: 'male',
    phone: '9425098765',
    routeFrom: 'Dhar Mandav Road',
    routeTo: 'Ujjain Mahakal Lok / Tower Chowk',
    departureDate: '2026-08-25', // Pre-planned future trip!
    departureTime: '07:00 AM',
    returnTime: '08:00 PM',
    totalSeats: 4,
    availableSeats: 3,
    bookings: [
      { id: 'b-6', userName: 'Suresh Patel', userPhone: '99810XXXXX', bookedAt: new Date().toISOString(), isWaitlist: false },
    ],
    isFullyBooked: false,
    vehicleModel: 'Maruti Ertiga 7-Seater AC',
    fuelShare: '₹220 / seat',
    isFemaleOnly: false,
    liveGpsEnabled: true,
    notes: '📅 PRE-PLANNED TRIP for Ujjain Darshan on 25th Aug! Spacious 7-seater, plenty of luggage space.',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 'pool-104',
    type: 'SEEK',
    posterRole: 'PASSENGER',
    driverName: 'Sanjay Thakur (Passenger)',
    driverGender: 'male',
    phone: '8109745019',
    routeFrom: 'Dhar Bus Stand Area',
    routeTo: 'Indore Palasia / MG Road',
    departureDate: 'Daily (Mon-Fri)',
    departureTime: 'Reach by 09:00 AM',
    totalSeats: 1,
    availableSeats: 1,
    bookings: [],
    isFullyBooked: false,
    fuelShare: 'Ready to contribute fuel cost',
    isFemaleOnly: false,
    liveGpsEnabled: false,
    notes: 'Seeking daily morning ride partner to Indore office. Punctual and friendly.',
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
  {
    id: 'pool-105',
    type: 'OFFER',
    posterRole: 'CAR_OWNER',
    vehicleType: 'BIKE',
    driverName: 'Imran Khan',
    driverGender: 'male',
    phone: '9827011223',
    routeFrom: 'Dhar Rajgarh Naka',
    routeTo: 'Indore Rau Circle',
    departureDate: 'Daily (Mon-Sat)',
    departureTime: '07:45 AM',
    returnTime: '07:00 PM',
    totalSeats: 1,
    availableSeats: 1,
    bookings: [],
    isFullyBooked: false,
    vehicleModel: 'Bajaj Pulsar 150',
    vehicleNumber: 'MP-11-MK-2287',
    fuelShare: '₹190 / pillion',
    isFemaleOnly: false,
    liveGpsEnabled: true,
    notes: 'Spare helmet provided. Reach Rau in about 70 minutes on the bypass.',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'pool-106',
    type: 'OFFER',
    posterRole: 'CAR_OWNER',
    vehicleType: 'BIKE',
    driverName: 'Sneha Patidar',
    driverGender: 'female',
    phone: '9755044332',
    routeFrom: 'Dhar LIG Colony',
    routeTo: 'Indore Bhawarkua Square',
    departureDate: 'Daily (Mon-Fri)',
    departureTime: '08:15 AM',
    returnTime: '05:45 PM',
    totalSeats: 1,
    availableSeats: 1,
    bookings: [],
    isFullyBooked: false,
    vehicleModel: 'Honda Activa 6G',
    fuelShare: '₹180 / pillion',
    isFemaleOnly: true,
    liveGpsEnabled: true,
    notes: 'Female pillion only. Regular run to Bhawarkua coaching area.',
    createdAt: new Date(Date.now() - 3600000 * 7).toISOString(),
  },
  {
    id: 'pool-107',
    type: 'CAB_POOL',
    posterRole: 'COMMUTER_GROUP',
    vehicleType: 'TAXI',
    driverName: 'Dhar IT Commuters Group',
    driverGender: 'male',
    phone: '8109745019',
    routeFrom: 'Dhar Bus Stand',
    routeTo: 'Indore Vijay Nagar (IT Park)',
    departureDate: 'Daily (Mon-Fri)',
    departureTime: '08:00 AM',
    returnTime: '06:30 PM',
    totalSeats: 4,
    availableSeats: 1,
    bookings: [
      { id: 'b-7', userName: 'Kunal Mehta', userPhone: '99770XXXXX', bookedAt: new Date().toISOString(), isWaitlist: false },
      { id: 'b-8', userName: 'Farhan Sheikh', userPhone: '97550XXXXX', bookedAt: new Date().toISOString(), isWaitlist: false },
      { id: 'b-9', userName: 'Divya Rathore', userPhone: '98270XXXXX', bookedAt: new Date().toISOString(), isWaitlist: false },
    ],
    isFullyBooked: false,
    vehicleModel: 'Booked Ertiga (shared taxi)',
    fuelShare: '₹410 / seat (meter split 4 ways)',
    isFemaleOnly: false,
    liveGpsEnabled: true,
    notes: 'Standing taxi booking, one seat opened up. Doorstep pickup inside Dhar town.',
    createdAt: new Date(Date.now() - 3600000 * 9).toISOString(),
  },
  {
    id: 'pool-108',
    type: 'OFFER',
    posterRole: 'CAR_OWNER',
    vehicleType: 'CAR',
    driverName: 'Ankit Chouhan',
    driverGender: 'male',
    phone: '9893177889',
    routeFrom: 'Indore Palasia Square',
    routeTo: 'Dhar Mohan Talkies Square',
    departureDate: 'Daily (Mon-Sat)',
    departureTime: '06:45 PM',
    totalSeats: 3,
    availableSeats: 3,
    bookings: [],
    isFullyBooked: false,
    vehicleModel: 'Hyundai i20 AC',
    vehicleNumber: 'MP-09-CH-7741',
    fuelShare: '₹160 / seat',
    isFemaleOnly: false,
    liveGpsEnabled: true,
    notes: 'Evening return leg. Drops anywhere on Indore–Dhar highway on request.',
    createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
  },
];

// In-memory store helper
class CarpoolStore {
  private posts: CarpoolPost[] = [...initialCarpoolPosts];

  getPosts(): CarpoolPost[] {
    return this.posts;
  }

  addPost(post: Omit<CarpoolPost, 'id' | 'createdAt' | 'bookings' | 'availableSeats' | 'isFullyBooked'>): CarpoolPost {
    const newPost: CarpoolPost = {
      ...post,
      id: `pool-${Date.now()}`,
      availableSeats: post.totalSeats,
      bookings: [],
      isFullyBooked: false,
      createdAt: new Date().toISOString(),
    };
    this.posts.unshift(newPost);
    return newPost;
  }

  bookSeat(postId: string, userName: string, userPhone: string): { post: CarpoolPost; isWaitlist: boolean; waitlistNumber?: number } | null {
    const post = this.posts.find((p) => p.id === postId);
    if (!post) return null;

    if (post.availableSeats > 0) {
      // Direct Booking
      const booking: CarpoolBooking = {
        id: `b-${Date.now()}`,
        userName,
        userPhone,
        bookedAt: new Date().toISOString(),
        isWaitlist: false,
      };
      post.bookings.push(booking);
      post.availableSeats -= 1;
      if (post.availableSeats === 0) {
        post.isFullyBooked = true;
      }
      return { post, isWaitlist: false };
    } else {
      // Add to Waitlist
      const currentWaitlistCount = post.bookings.filter((b) => b.isWaitlist).length;
      const waitlistNumber = currentWaitlistCount + 1;
      const booking: CarpoolBooking = {
        id: `b-${Date.now()}`,
        userName,
        userPhone,
        bookedAt: new Date().toISOString(),
        isWaitlist: true,
        waitlistNumber,
      };
      post.bookings.push(booking);
      return { post, isWaitlist: true, waitlistNumber };
    }
  }

  cancelBooking(postId: string, bookingId: string): CarpoolPost | null {
    const post = this.posts.find((p) => p.id === postId);
    if (!post) return null;

    const bookingIndex = post.bookings.findIndex((b) => b.id === bookingId);
    if (bookingIndex === -1) return post;

    const removedBooking = post.bookings[bookingIndex];
    post.bookings.splice(bookingIndex, 1);

    if (!removedBooking.isWaitlist) {
      // A confirmed booking was cancelled!
      // Check if there is someone on the waitlist to auto-promote
      const firstWaitlisted = post.bookings.find((b) => b.isWaitlist);
      if (firstWaitlisted) {
        firstWaitlisted.isWaitlist = false;
        delete firstWaitlisted.waitlistNumber;
        // Re-index remaining waitlisted users
        let wlIndex = 1;
        post.bookings.forEach((b) => {
          if (b.isWaitlist) {
            b.waitlistNumber = wlIndex++;
          }
        });
      } else {
        post.availableSeats += 1;
        post.isFullyBooked = false;
      }
    } else {
      // A waitlisted booking was cancelled -> re-index remaining waitlist
      let wlIndex = 1;
      post.bookings.forEach((b) => {
        if (b.isWaitlist) {
          b.waitlistNumber = wlIndex++;
        }
      });
    }

    return post;
  }

  clearAll(): void {
    this.posts = [];
  }
}

export const carpoolStore = new CarpoolStore();
