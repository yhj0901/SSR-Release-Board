import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("releases")
      .select(
        "id, product_name, dev_end_date, qa_end_date, release_date, version, created_at, updated_at"
      )
      .order("product_name", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch releases" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const {
      product_name,
      dev_end_date,
      qa_end_date,
      release_date,
      version,
      release_notes,
      change_note,
    } = body;

    if (!product_name || !dev_end_date || !qa_end_date || !release_date) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const versionValue = version || "1.0.0";

    // Create new release
    const { data, error } = await supabase
      .from("releases")
      .insert([
        {
          product_name,
          dev_end_date,
          qa_end_date,
          release_date,
          version: versionValue,
        },
      ])
      .select(
        "id, product_name, dev_end_date, qa_end_date, release_date, version, created_at, updated_at"
      );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Add initial version to history
    if (data && data.length > 0) {
      const { error: historyError } = await supabase
        .from("version_history")
        .insert({
          release_id: data[0].id,
          version: versionValue,
          product_name,
          dev_end_date,
          qa_end_date,
          release_date,
          release_notes: release_notes || null,
          change_note: change_note || "Initial version",
        });

      if (historyError) {
        console.error("Failed to add initial version history:", historyError);
      }
    }

    return NextResponse.json(data[0], { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create release" },
      { status: 500 }
    );
  }
}
