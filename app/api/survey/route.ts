import { NextRequest, NextResponse } from 'next/server';

export interface SurveyResponseItem {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  userCategory?: string;
  route: string;
  frequency: string;
  preferredPlan: string;
  pickupPreference: string;
  topPriority: string;
  feedback?: string;
  timestamp: string;
}

// Clean live store - empty array for real user survey submissions only
let surveyResponsesStore: SurveyResponseItem[] = [];

export async function GET() {
  return NextResponse.json({
    status: 'success',
    count: surveyResponsesStore.length,
    responses: surveyResponsesStore
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName, phone, email, userCategory, route, frequency, preferredPlan, pickupPreference, topPriority, feedback } = body;

    if (!fullName || !phone) {
      return NextResponse.json({ status: 'error', message: 'Name and phone are required' }, { status: 400 });
    }

    const newResponse: SurveyResponseItem = {
      id: `SRV-${Math.floor(1000 + Math.random() * 9000)}`,
      fullName,
      phone,
      email: email || '',
      userCategory: userCategory || 'professional',
      route: route || 'DHR-IND',
      frequency: frequency || 'mon_fri',
      preferredPlan: preferredPlan || 'pass_50',
      pickupPreference: pickupPreference || 'doorstep',
      topPriority: topPriority || 'doorstep_direct',
      feedback: feedback || '',
      timestamp: new Date().toISOString()
    };

    surveyResponsesStore.unshift(newResponse);

    return NextResponse.json({
      status: 'success',
      message: 'Survey response submitted successfully',
      data: newResponse
    });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}

export async function DELETE() {
  surveyResponsesStore = [];
  return NextResponse.json({ status: 'success', message: 'All survey responses cleared' });
}
