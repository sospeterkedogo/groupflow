import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/agents/tasks/[id]
 * Returns pending/in_progress tasks for the given agent.
 * The [id] segment accepts either an agent UUID or agent name.
 * Note: Unlike POST /[id]/complete which requires a task UUID, this endpoint
 * accepts an agent UUID or agent name to look up the agent's assigned tasks.
 * Used by automated agent workers to poll for their next assignment.
 * Requires the X-Agent-Key header to match AGENT_API_KEY env var.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Lightweight API-key auth (agents don't have browser sessions)
  const apiKey = req.headers.get('x-agent-key');
  if (!apiKey || apiKey !== process.env.AGENT_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: agentIdOrName } = await params;
  if (!agentIdOrName) {
    return NextResponse.json({ error: 'agent identifier required' }, { status: 400 });
  }

  const admin = await createAdminClient();

  // Resolve agent name → id if a name was passed instead of UUID
  let resolvedId = agentIdOrName;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(agentIdOrName)) {
    const { data: agent } = await admin
      .from('agents')
      .select('id')
      .ilike('name', agentIdOrName)
      .single();
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }
    resolvedId = agent.id;
  }

  interface AgentTask {
    id: string;
    title: string;
    description: string;
    priority: string;
    status: string;
    depends_on: string[] | null;
    output_artifacts: unknown;
    logs: string | null;
    created_at: string;
  }

  // Fetch tasks assigned to this agent that are ready to work on
  const { data: rawTasks, error } = await admin
    .from('agent_tasks')
    .select('id, title, description, priority, status, depends_on, output_artifacts, logs, created_at')
    .eq('assigned_agent_id', resolvedId)
    .in('status', ['not_started', 'in_progress'])
    .order('priority', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(10);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const tasks = (rawTasks ?? []) as AgentTask[];

  // Filter out tasks whose dependencies aren't done yet
  const allDependencyIds = [...new Set(tasks.flatMap(t => t.depends_on ?? []))];
  let completedDeps: string[] = [];

  if (allDependencyIds.length > 0) {
    const { data: doneTasks } = await admin
      .from('agent_tasks')
      .select('id')
      .in('id', allDependencyIds)
      .eq('status', 'done');
    completedDeps = (doneTasks as { id: string }[] | null)?.map(t => t.id) ?? [];
  }

  const readyTasks = tasks.filter(task => {
    const deps = task.depends_on ?? [];
    return deps.every(depId => completedDeps.includes(depId));
  });

  return NextResponse.json({ tasks: readyTasks, total: readyTasks.length });
}
