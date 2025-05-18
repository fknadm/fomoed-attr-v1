import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { projects } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const db = getDb()
    const project = await db.query.projects.findFirst({
      where: (projects, { eq }) => eq(projects.id, params.id),
      with: {
        owner: true,
        campaigns: {
          with: {
            requirements: true,
            applications: {
              with: {
                creator: true,
                metrics: true,
              },
            },
          },
        },
      },
    })
    
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(project)
  } catch (error) {
    console.error('Error fetching project:', error)
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const db = getDb()
    
    await db.update(projects)
      .set({
        name: body.name,
        description: body.description,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, params.id))

    const project = await db.query.projects.findFirst({
      where: (projects, { eq }) => eq(projects.id, params.id),
      with: {
        owner: true,
        campaigns: true,
      },
    })
    
    return NextResponse.json(project)
  } catch (error) {
    console.error('Error updating project:', error)
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const db = getDb()
    
    await db.delete(projects)
      .where(eq(projects.id, params.id))
    
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    )
  }
} 