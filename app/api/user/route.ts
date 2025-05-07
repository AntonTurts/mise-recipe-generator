// app/api/user/route.ts
import { NextResponse } from 'next/server';
import { auth } from '../../../lib/firebase';
import { User } from '../../../lib/types';

export async function GET(
  request: Request,
  { params }: { params: Promise<{}> }
) {
  try {
    // Get the current user
    const user = auth.currentUser;
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    return NextResponse.json({ 
      id: user.uid,
      email: user.email,
      name: user.displayName
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{}> }
) {
  try {
    const user = auth.currentUser;
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const data = await request.json();
    
    // Process user data update
    // This would typically update the user's profile in Firestore
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating user data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}