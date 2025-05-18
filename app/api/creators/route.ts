import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { creatorProfiles } from '@/db/schema';
import { nanoid } from 'nanoid';

export async function GET() {
  try {
    const db = getDb();
    const creators = await db.query.creatorProfiles.findMany({
      with: {
        user: true,
        applications: {
          with: {
            campaign: true,
          },
        },
      },
    });
    
    return NextResponse.json(creators);
  } catch (error) {
    console.error('Error fetching creators:', error);
    return NextResponse.json(
      { error: 'Failed to fetch creators' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const db = getDb();
    
    const creatorProfile = await db.insert(creatorProfiles).values({
      id: nanoid(),
      userId: body.userId,
      bio: body.bio,
      twitterHandle: body.twitterHandle,
      twitterFollowers: body.twitterFollowers,
      discordHandle: body.discordHandle,
      websiteUrl: body.websiteUrl,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const creator = await db.query.creatorProfiles.findFirst({
      where: (creators, { eq }) => eq(creators.id, creatorProfile[0].id),
      with: {
        user: true,
      },
    });
    
    return NextResponse.json(creator, { status: 201 });
  } catch (error) {
    console.error('Error creating creator profile:', error);
    return NextResponse.json(
      { error: 'Failed to create creator profile' },
      { status: 500 }
    );
  }
} 