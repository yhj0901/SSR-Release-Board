import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const body = await request.json();

    const {
      version,
      product_name,
      dev_end_date,
      qa_end_date,
      release_date,
      release_notes,
      change_note,
    } = body;

    if (
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
      .update({
        version,
        product_name,
        dev_end_date,
        qa_end_date,
        release_date,
        release_notes: release_notes || null,
        change_note: change_note || null,
      })
      .eq("id", id)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: "Version history not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(data[0]);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update version history" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    const { error } = await supabase
      .from("version_history")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      message: "Version history deleted successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete version history" },
      { status: 500 }
    );
  }
}
