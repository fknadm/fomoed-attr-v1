import { NextResponse } from 'next/server'

export async function GET() {
  // Hardcoded response for testing
  return NextResponse.json({
    id: 'creator_1',
    userId: 'user_1',
    bio: 'Web3 content creator and community builder',
    twitterHandle: '@web3_creator',
    twitterFollowers: 35000,
    discordHandle: 'web3_creator#1234',
    websiteUrl: 'https://web3-creator.io',
    tier: 'GOLD',
    user: {
      id: 'user_1',
      name: 'Web3 Creator',
      email: 'creator@example.com',
    },
    applications: [],
  })
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const db = getDb()
    // TODO: Get the authenticated user's ID from the session
    const userId = 'user_1' // Temporary for testing

    await db.query.creatorProfiles.findFirst({
      where: (profiles, { eq }) => eq(profiles.userId, userId),
    })

    const profile = await db.query.creatorProfiles.findFirst({
      where: (profiles, { eq }) => eq(profiles.userId, userId),
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
      .where(eq(creatorProfiles.userId, userId))

    const updatedProfile = await db.query.creatorProfiles.findFirst({
      where: (profiles, { eq }) => eq(profiles.userId, userId),
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