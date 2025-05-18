import { NextResponse } from 'next/server';
import { getDb, queryHelper } from '@/lib/db';
import { creatorProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const db = getDb();
    const creator = await queryHelper.getCreatorWithApplications(db, params.id);
    
    if (!creator) {
      return NextResponse.json(
        { error: 'Creator not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(creator);
  } catch (error) {
    console.error('Error fetching creator:', error);
    return NextResponse.json(
      { error: 'Failed to fetch creator' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const db = getDb();
    
    await db.update(creatorProfiles)
      .set({
        bio: body.bio,
        twitterHandle: body.twitterHandle,
        twitterFollowers: body.twitterFollowers,
        discordHandle: body.discordHandle,
        websiteUrl: body.websiteUrl,
        updatedAt: new Date(),
      })
      .where(eq(creatorProfiles.id, params.id));

    const creator = await queryHelper.getCreatorWithApplications(db, params.id);
    
    return NextResponse.json(creator);
  } catch (error) {
    console.error('Error updating creator:', error);
    return NextResponse.json(
      { error: 'Failed to update creator' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const db = getDb();
    
    await db.delete(creatorProfiles)
      .where(eq(creatorProfiles.id, params.id));
    
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting creator:', error);
    return NextResponse.json(
      { error: 'Failed to delete creator' },
      { status: 500 }
    );
  }
} 