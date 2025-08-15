
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.51.0";

serve(async (req) => {
  try {
    const body = await req.json().catch(() => ({}));
    const { type } = body || {};

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ error: "Missing Supabase env" }), { status: 500 });
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      global: { headers: { Authorization: req.headers.get("Authorization") || "" } },
    });

    if (type === "early_termination_request") {
      const title = "طلب إلغاء عقد مبكر";
      const message = `تم تقديم طلب إلغاء مبكر للعقد ${body.contract_number || ""} من العميل ${body.customer_name || ""}. المبلغ المستحق: ${body.total_amount_due || 0} ريال.`;
      const payload = {
        p_title: title,
        p_message: message,
        p_type: "warning",
        p_category: "contract",
        p_priority: "high",
        p_reference_type: "early_termination_request",
        p_reference_id: body.request_id || null,
        p_reference_data: body || null,
        p_user_id: null,
        p_target_roles: ["manager"],
        p_action_required: true,
        p_scheduled_for: new Date().toISOString(),
        p_delivery_channels: ["in_app"],
      };

      const { error: rpcError } = await supabase.rpc("create_smart_notification", payload);
      if (rpcError) {
        console.error("Notification RPC error:", rpcError);
        return new Response(JSON.stringify({ ok: false, error: rpcError.message }), { status: 500 });
      }

      return new Response(JSON.stringify({ ok: true }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });
    }

    return new Response(JSON.stringify({ ok: true, msg: "No action taken" }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e) {
    console.error("Edge function error:", e);
    return new Response(JSON.stringify({ error: "Unhandled error" }), { status: 500 });
  }
});
