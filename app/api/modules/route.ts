import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: modules, error } = await supabase
      .from("modules")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching modules:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(modules);
  } catch (error) {
    console.error("Error in GET /api/modules:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { name, description } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Module name is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("modules")
      .insert([{ name: name.trim(), description: description?.trim() || null }])
      .select()
      .single();

    if (error) {
      console.error("Error creating module:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/modules:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
