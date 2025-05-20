import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { projects } from '@/db/schema'
import { nanoid } from 'nanoid'
import { z } from 'zod'

const createProjectSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  website: z.string().url().optional(),
  twitter: z.string().optional(),
  discord: z.string().optional(),
})

export async function GET() {
  try {
    const db = getDb()
    const allProjects = await db.query.projects.findMany({
      with: {
        owner: true,
        campaigns: true,
      },
    })
    return NextResponse.json(allProjects)
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    // TODO: Implement proper auth
    const userId = 'test-user-id' // This should come from the authenticated user

    const body = await request.json()
    const validatedData = createProjectSchema.parse(body)

    const db = getDb()
    const result = await db.insert(projects).values({
      id: nanoid(),
      ...validatedData,
      ownerId: userId,
    }).returning()

    const project = result[0]
    return NextResponse.json(project)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating project:', error)
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    )
  }
} 