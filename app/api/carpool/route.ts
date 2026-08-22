import { NextResponse } from 'next/server';
import { carpoolStore } from '@/lib/carpool-store';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // OFFER | SEEK | CAB_POOL
    const vehicleType = searchParams.get('vehicleType'); // CAR | BIKE | TAXI
    const femaleOnly = searchParams.get('femaleOnly');
    const search = searchParams.get('search');

    let posts = carpoolStore.getPosts();

    if (type && type !== 'ALL') {
      posts = posts.filter((p) => p.type === type);
    }

    if (vehicleType && vehicleType !== 'ALL') {
      // Posts predating the vehicleType field are all cars.
      posts = posts.filter((p) => (p.vehicleType ?? 'CAR') === vehicleType);
    }

    if (femaleOnly === 'true') {
      posts = posts.filter((p) => p.isFemaleOnly);
    }

    if (search) {
      const query = search.toLowerCase();
      posts = posts.filter(
        (p) =>
          p.routeFrom.toLowerCase().includes(query) ||
          p.routeTo.toLowerCase().includes(query) ||
          p.driverName.toLowerCase().includes(query) ||
          (p.vehicleModel && p.vehicleModel.toLowerCase().includes(query))
      );
    }

    return NextResponse.json({ success: true, posts });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch carpool posts' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.driverName || !body.phone || !body.routeFrom || !body.routeTo || !body.departureTime) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const newPost = carpoolStore.addPost({
      type: body.type || 'OFFER',
      posterRole: body.posterRole || (body.type === 'OFFER' ? 'CAR_OWNER' : 'PASSENGER'),
      vehicleType: ['CAR', 'BIKE', 'TAXI'].includes(body.vehicleType) ? body.vehicleType : 'CAR',
      driverName: body.driverName,
      driverGender: body.driverGender || 'male',
      phone: body.phone,
      routeFrom: body.routeFrom,
      routeTo: body.routeTo,
      departureDate: body.departureDate || 'Daily',
      departureTime: body.departureTime,
      returnTime: body.returnTime || '',
      totalSeats: Number(body.totalSeats) || 1,
      vehicleModel: body.vehicleModel || '',
      vehicleNumber: body.vehicleNumber || '',
      fuelShare: body.fuelShare || 'Fuel Share',
      isFemaleOnly: Boolean(body.isFemaleOnly),
      liveGpsEnabled: Boolean(body.liveGpsEnabled),
      notes: body.notes || '',
    });

    return NextResponse.json({ success: true, post: newPost }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create carpool post' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { postId, action, userName, userPhone, bookingId } = body;

    if (!postId || !action) {
      return NextResponse.json({ success: false, error: 'postId and action required' }, { status: 400 });
    }

    if (action === 'BOOK_SEAT') {
      if (!userName || !userPhone) {
        return NextResponse.json({ success: false, error: 'Name and phone required for booking' }, { status: 400 });
      }

      const result = carpoolStore.bookSeat(postId, userName, userPhone);
      if (!result) {
        return NextResponse.json({ success: false, error: 'Trip not found' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        post: result.post,
        isWaitlist: result.isWaitlist,
        waitlistNumber: result.waitlistNumber,
        message: result.isWaitlist
          ? `Added to Waitlist #${result.waitlistNumber}. We will notify you if a seat opens up!`
          : 'Seat Booked Successfully!',
      });
    }

    if (action === 'CANCEL_BOOKING') {
      if (!bookingId) {
        return NextResponse.json({ success: false, error: 'bookingId required' }, { status: 400 });
      }

      const updatedPost = carpoolStore.cancelBooking(postId, bookingId);
      return NextResponse.json({ success: true, post: updatedPost });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update booking' }, { status: 500 });
  }
}

export async function DELETE() {
  carpoolStore.clearAll();
  return NextResponse.json({ success: true, message: 'All carpool posts cleared' });
}
