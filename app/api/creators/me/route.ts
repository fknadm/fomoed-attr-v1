import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { creatorProfiles } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function GET() {
  try {
    const db = getDb()
    const profile = await db.query.creatorProfiles.findFirst({
      with: {
        user: true,
        applications: {
          with: {
            campaign: {
              with: {
                project: true,
              },
            },
            metrics: true,
          },
        },
      },
    })

    if (!profile) {
      return NextResponse.json(
        { error: 'No creator profiles found' },
        { status: 404 }
      )
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error('Error fetching creator profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch creator profile' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const db = getDb()

    const profile = await db.query.creatorProfiles.findFirst({
      with: {
        user: true,
      },
    })

    if (!profile) {
      return NextResponse.json(
        { error: 'Creator profile not found' },
        { status: 404 }
      )
    }

    // Update profile
    await db.update(creatorProfiles)
      .set({
        bio: body.bio,
        twitterHandle: body.twitterHandle,
        twitterFollowers: body.twitterFollowers,
        discordHandle: body.discordHandle,
        websiteUrl: body.websiteUrl,
        updatedAt: new Date(),
      })
      .where(eq(creatorProfiles.id, profile.id))

    const updatedProfile = await db.query.creatorProfiles.findFirst({
      where: (profiles, { eq }) => eq(profiles.id, profile.id),
      with: {
        user: true,
        applications: {
          with: {
            campaign: {
              with: {
                project: true,
              },
            },
            metrics: true,
          },
        },
      },
    })
    
    return NextResponse.json(updatedProfile)
  } catch (error) {
    console.error('Error updating creator profile:', error)
    return NextResponse.json(
      { error: 'Failed to update creator profile' },
      { status: 500 }
    )
  }
} 