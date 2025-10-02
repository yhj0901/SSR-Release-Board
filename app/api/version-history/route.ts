import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const {
      release_id,
      version,
      product_name,
      dev_end_date,
      qa_end_date,
      release_date,
      release_notes,
      change_note,
    } = body;

    if (
      !release_id ||
      !version ||
      !product_name ||
      !dev_end_date ||
      !qa_end_date ||
      !release_date
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("version_history")
      .insert({
        release_id,
        version,
        product_name,
        dev_end_date,
        qa_end_date,
        release_date,
        release_notes: release_notes || null,
        change_note: change_note || null,
      })
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data[0], { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create version history" },
      { status: 500 }
    );
  }
}
