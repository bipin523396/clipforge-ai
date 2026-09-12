import { NextResponse } from 'next/server';
import { getProjectById, updateProjectInStore, permanentlyDeleteProject } from '@/lib/server/project-store';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const project = await getProjectById(id);
    if (!project) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, project });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const updates = await req.json();
    const updated = await updateProjectInStore(id, updates);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Project not found or update failed' }, { status: 404 });
    }
    return NextResponse.json({ success: true, project: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const deletionResult = await permanentlyDeleteProject(id);
    return NextResponse.json({
      success: true,
      message: `Project ${id} and all related renders, source media, jobs, and Supabase cloud files permanently purged.`,
      result: deletionResult,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

