import { NextResponse } from 'next/server';
import { getAllProjects, saveProject } from '@/lib/server/project-store';
import { Project } from '@/types';

export async function GET() {
  try {
    const projects = await getAllProjects();
    return NextResponse.json({
      success: true,
      projects,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const candidateProject: Project = body.project || body;

    if (candidateProject && candidateProject.id && candidateProject.title) {
      const saved = await saveProject(candidateProject);
      return NextResponse.json({
        success: true,
        message: 'Project created and saved to Supabase',
        project: saved,
        projectId: saved.id,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Project payload received',
      projectId: `proj-${Date.now()}`,
      data: body,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Invalid payload' }, { status: 400 });
  }
}

