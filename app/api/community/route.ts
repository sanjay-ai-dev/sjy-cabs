import { NextRequest, NextResponse } from 'next/server';

export interface CommunityMemberItem {
  id: string;
  fullName: string;
  phone: string;
  gender: 'female' | 'male' | 'other' | string;
  route: string;
  commuterType: string;
  verificationStatus: 'pending_on_call_verification' | 'verified' | 'rejected';
  femaleSafetyPriority: boolean;
  timestamp: string;
}

// In-memory store for community member requests
let communityMembersStore: CommunityMemberItem[] = [];

const WHATSAPP_COMMUNITY_URL = 'https://chat.whatsapp.com/LYayG0ZM9MOK8gFsN1lWte';

export async function GET() {
  return NextResponse.json({
    status: 'success',
    whatsappCommunityUrl: WHATSAPP_COMMUNITY_URL,
    count: communityMembersStore.length,
    members: communityMembersStore
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName, phone, gender, route, commuterType } = body;

    if (!fullName || !phone) {
      return NextResponse.json(
        { status: 'error', message: 'Full name and WhatsApp phone number are required' },
        { status: 400 }
      );
    }

    const isFemale = gender === 'female';

    const newMember: CommunityMemberItem = {
      id: `COMM-${Math.floor(10000 + Math.random() * 90000)}`,
      fullName,
      phone,
      gender: gender || 'female',
      route: route || 'Dhar ↔ Indore',
      commuterType: commuterType || 'Daily Commuter',
      verificationStatus: 'pending_on_call_verification',
      femaleSafetyPriority: isFemale,
      timestamp: new Date().toISOString()
    };

    communityMembersStore.unshift(newMember);

    return NextResponse.json({
      status: 'success',
      message: 'Community registration received. Please join the WhatsApp group.',
      whatsappCommunityUrl: WHATSAPP_COMMUNITY_URL,
      data: newMember
    });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}
