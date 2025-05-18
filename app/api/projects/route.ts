import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { projects } from '@/db/schema'
import { nanoid } from 'nanoid'

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
    const body = await request.json()
    const db = getDb()
    
    const project = await db.insert(projects).values({
      id: nanoid(),
      name: body.name,
      description: body.description,
      ownerId: body.ownerId, // This should come from the authenticated user
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const newProject = await db.query.projects.findFirst({
      where: (projects, { eq }) => eq(projects.id, project[0].id),
      with: {
        owner: true,
      },
    })
    
    return NextResponse.json(newProject, { status: 201 })
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    )
  }
} 