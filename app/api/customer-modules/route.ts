import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customer_id");

    let query = supabase
      .from("customer_module_versions")
      .select(
        `
        *,
        customer:customers(id, name),
        module:modules(id, name, description)
      `
      )
      .order("created_at", { ascending: false });

    if (customerId) {
      query = query.eq("customer_id", customerId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching customer modules:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in GET /api/customer-modules:", error);
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
    const { customer_id, module_id, version, image_url, notes, uploaded_by } =
      body;

    if (!customer_id || !module_id) {
      return NextResponse.json(
        { error: "Customer ID and Module ID are required" },
        { status: 400 }
      );
    }

    // Upsert: 존재하면 업데이트, 없으면 삽입
    const { data, error } = await supabase
      .from("customer_module_versions")
      .upsert(
        [
          {
            customer_id,
            module_id,
            version: version || null,
            image_url: image_url || null,
            notes: notes || null,
            uploaded_by: uploaded_by || null,
          },
        ],
        {
          onConflict: "customer_id,module_id",
        }
      )
      .select(
        `
        *,
        customer:customers(id, name),
        module:modules(id, name, description)
      `
      )
      .single();

    if (error) {
      console.error("Error saving customer module:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/customer-modules:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
