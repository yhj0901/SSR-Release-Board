import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { version, image_url, notes, uploaded_by } = body;

    const { data, error } = await supabase
      .from("customer_module_versions")
      .update({
        version: version || null,
        image_url: image_url || null,
        notes: notes || null,
        uploaded_by: uploaded_by || null,
      })
      .eq("id", params.id)
      .select(
        `
        *,
        customer:customers(id, name),
        module:modules(id, name, description)
      `
      )
      .single();

    if (error) {
      console.error("Error updating customer module:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in PUT /api/customer-modules:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("customer_module_versions")
      .delete()
      .eq("id", params.id);

    if (error) {
      console.error("Error deleting customer module:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/customer-modules:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
