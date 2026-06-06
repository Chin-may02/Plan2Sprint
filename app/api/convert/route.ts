import { NextRequest, NextResponse } from "next/server";
import { convertPrdToTasks } from "@/lib/anthropic";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prd, userId } = body as { prd: string; userId?: string };

    if (!prd || typeof prd !== "string" || prd.trim().length < 50) {
      return NextResponse.json(
        { error: "PRD text must be at least 50 characters." },
        { status: 400 }
      );
    }

    // Call Claude
    const output = await convertPrdToTasks(prd.trim());

    // If authenticated, save to Supabase using service role
    if (userId) {
      const supabase = createServiceClient();
      const { error: dbError } = await supabase.from("conversions").insert({
        user_id: userId,
        prd_text: prd.trim(),
        output,
      });

      if (dbError) {
        console.error("Failed to save conversion:", dbError);
        // Don't fail the request — just log
      }
    }

    return NextResponse.json({ output }, { status: 200 });
  } catch (err: unknown) {
    console.error("Convert API error:", err);
    const message = err instanceof Error ? err.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
