import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isIndexNowConfigured } from "@/lib/public-site/indexnow";
export async function GET() { const supabase = await createServerSupabaseClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) return NextResponse.json({ configured: false }, { status: 401 }); return NextResponse.json({ configured: isIndexNowConfigured() }); }
