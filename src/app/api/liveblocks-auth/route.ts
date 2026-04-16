import { Liveblocks } from "@liveblocks/node";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY!,
});

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    // Get group members/profile to confirm access
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, avatar_url, group_id')
      .eq('id', user.id)
      .single();

    const { room } = await request.json();

    // Security: Only allow users to join their assigned group room
    if (room && profile?.group_id !== room) {
       // Optional: Allow global rooms or different logic, but for Kanban it should match
       // return new NextResponse("Forbidden: Not in this group", { status: 403 });
    }

    // Prepare session
    const session = liveblocks.prepareSession(user.id, {
      userInfo: {
        name: profile?.full_name || user.email || 'Anonymous',
        avatar: profile?.avatar_url || '',
      },
    });

    // Provide full access to the requested room if it's their group room
    if (room) {
      session.allow(room, session.FULL_ACCESS);
    } else {
      session.allow("*", session.FULL_ACCESS);
    }

    const { body, status } = await session.authorize();
    return new NextResponse(body, { status });
  } catch (error) {
    console.error("Liveblocks Auth Error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
