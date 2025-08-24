
/* eslint-disable */
// Deno Edge Function: sync-tracker-devices
// Modes:
// - auto   : Try to login to the tracking site and fetch devices (scaffold, requires page paths)
// - manual : Accept payload.devices = [{ plate, trackerId, latitude?, longitude?, address? }]

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

type DeviceInput = {
  plate: string;
  trackerId: string;
  latitude?: number;
  longitude?: number;
  address?: string;
};

type SyncRequest = {
  mode?: "auto" | "manual";
  devices?: DeviceInput[];
};

type Summary = {
  matched: number;
  updatedVehicles: number;
  upsertedMappings: number;
  updatedLocations: number;
  skipped: number;
  errors: string[];
  mode: "auto" | "manual";
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const url = new URL(req.url);
  const isHealth = url.pathname.endsWith("/health");
  if (req.method === "GET" && isHealth) {
    return new Response(JSON.stringify({ ok: true }), {
      headers: { "content-type": "application/json", ...corsHeaders },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "content-type": "application/json", ...corsHeaders },
    });
  }

  const body: SyncRequest = await req.json().catch(() => ({} as SyncRequest));
  const mode: "auto" | "manual" = body.mode ?? "auto";

  const summary: Summary = {
    matched: 0,
    updatedVehicles: 0,
    upsertedMappings: 0,
    updatedLocations: 0,
    skipped: 0,
    errors: [],
    mode,
  };

  // Fetch all vehicles once for matching
  const { data: vehicles, error: vehiclesError } = await supabase
    .from("vehicles")
    .select("id, plate_number");

  if (vehiclesError) {
    return new Response(JSON.stringify({ error: vehiclesError.message }), {
      status: 500,
      headers: { "content-type": "application/json", ...corsHeaders },
    });
  }

  const normalizePlate = (plate?: string) => {
    if (!plate) return "";
    // Mirror of DB normalize function (basic transliteration)
    const map: Record<string, string> = {
      "أ": "ا",
      "إ": "ا",
      "آ": "ا",
      "ئ": "ي",
      "٠": "0",
      "١": "1",
      "٢": "2",
      "٣": "3",
      "٤": "4",
      "٥": "5",
      "٦": "6",
      "٧": "7",
      "٨": "8",
      "٩": "9",
    };
    let s = plate.trim();
    s = s.replace(/[أإآ]/g, "ا").replace(/ئ/g, "ي");
    s = s.replace(/[٠١٢٣٤٥٦٧٨٩]/g, (d) => map[d] ?? d);
    s = s.replace(/[^ا-ي0-9]/g, "");
    return s;
  };

  const plateIndex = new Map<string, { id: string; plate: string }>();
  for (const v of vehicles ?? []) {
    plateIndex.set(normalizePlate(v.plate_number), { id: v.id, plate: v.plate_number });
  }

  // Helper to process a single device record
  const processDevice = async (d: DeviceInput) => {
    const normalized = normalizePlate(d.plate);
    const match = plateIndex.get(normalized);

    if (!match) {
      summary.skipped += 1;
      summary.errors.push(`No vehicle match for plate: ${d.plate}`);
      return;
    }

    summary.matched += 1;

    // 1) Update vehicles.tracker_id if needed
    const { error: updErr } = await supabase
      .from("vehicles")
      .update({ tracker_id: d.trackerId })
      .eq("id", match.id);

    if (!updErr) {
      summary.updatedVehicles += 1;
    } else {
      summary.errors.push(`Failed to update vehicle tracker_id for ${d.plate}: ${updErr.message}`);
    }

    // 2) Upsert vehicle_tracker_mappings
    const { error: mapErr } = await supabase
      .from("vehicle_tracker_mappings")
      .upsert({
        vehicle_id: match.id,
        tracker_id: d.trackerId,
        plate_number: match.plate,
        last_sync: new Date().toISOString(),
        sync_status: "active",
      }, { onConflict: "vehicle_id" });

    if (!mapErr) {
      summary.upsertedMappings += 1;
    } else {
      summary.errors.push(`Failed upsert mapping for ${d.plate}: ${mapErr.message}`);
    }

    // 3) Upsert vehicle_location if lat/lon provided
    if (typeof d.latitude === "number" && typeof d.longitude === "number") {
      // Check if a location row exists
      const { data: locRows, error: locSelErr } = await supabase
        .from("vehicle_location")
        .select("id")
        .eq("vehicle_id", match.id)
        .maybeSingle();

      if (locSelErr) {
        summary.errors.push(`Failed to read location for ${d.plate}: ${locSelErr.message}`);
      } else if (locRows?.id) {
        const { error: locUpdErr } = await supabase
          .from("vehicle_location")
          .update({
            latitude: d.latitude,
            longitude: d.longitude,
            address: d.address ?? null,
            is_tracked: true,
            last_updated: new Date().toISOString(),
          })
          .eq("id", locRows.id);

        if (locUpdErr) {
          summary.errors.push(`Failed to update location for ${d.plate}: ${locUpdErr.message}`);
        } else {
          summary.updatedLocations += 1;
        }
      } else {
        const { error: locInsErr } = await supabase
          .from("vehicle_location")
          .insert([{
            vehicle_id: match.id,
            latitude: d.latitude,
            longitude: d.longitude,
            address: d.address ?? null,
            is_tracked: true,
            last_updated: new Date().toISOString(),
          }]);

        if (locInsErr) {
          summary.errors.push(`Failed to insert location for ${d.plate}: ${locInsErr.message}`);
        } else {
          summary.updatedLocations += 1;
        }
      }
    }
  };

  if (mode === "manual") {
    const devices = body.devices ?? [];
    for (const d of devices) {
      if (!d.plate || !d.trackerId) {
        summary.skipped += 1;
        summary.errors.push("Invalid device record missing plate or trackerId");
        continue;
      }
      await processDevice(d);
    }

    return new Response(JSON.stringify({ success: true, summary }), {
      headers: { "content-type": "application/json", ...corsHeaders },
    });
  }

  // AUTO MODE (scaffold)
  // You can customize these paths after confirming the device list page path and selectors.
  const TRACKING_BASE = "http://194.165.139.226";
  const LOGIN_PATH = "/Login.aspx";
  const username = Deno.env.get("TRACKING_USERNAME");
  const password = Deno.env.get("TRACKING_PASSWORD");

  if (!username || !password) {
    summary.errors.push("Tracking credentials not configured: TRACKING_USERNAME / TRACKING_PASSWORD");
    return new Response(JSON.stringify({ success: false, summary }), {
      status: 400,
      headers: { "content-type": "application/json", ...corsHeaders },
    });
  }

  // Basic cookie jar
  let cookie = "";

  // 1) Load login page to fetch ASP.NET hidden fields
  const loginPageResp = await fetch(`${TRACKING_BASE}${LOGIN_PATH}`);
  cookie = mergeCookies(cookie, loginPageResp.headers.get("set-cookie"));
  const loginHtml = await loginPageResp.text();
  const viewState = extractHidden(loginHtml, "__VIEWSTATE");
  const eventValidation = extractHidden(loginHtml, "__EVENTVALIDATION");
  const viewStateGenerator = extractHidden(loginHtml, "__VIEWSTATEGENERATOR");

  // 2) Post login form (keys may differ, adjust after inspecting page)
  const form = new URLSearchParams();
  // Common ASP.NET fields
  if (viewState) form.set("__VIEWSTATE", viewState);
  if (eventValidation) form.set("__EVENTVALIDATION", eventValidation);
  if (viewStateGenerator) form.set("__VIEWSTATEGENERATOR", viewStateGenerator);
  // Likely input names - adjust to actual names from the page
  form.set("txtUserName", username);
  form.set("txtPassword", password);
  form.set("btnLogin", "Login");

  const loginResp = await fetch(`${TRACKING_BASE}${LOGIN_PATH}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Cookie": cookie,
    },
    body: form.toString(),
    redirect: "manual",
  });
  cookie = mergeCookies(cookie, loginResp.headers.get("set-cookie"));
  const loginStatus = loginResp.status;

  if (loginStatus >= 300 && loginStatus < 400) {
    // redirected after successful login: continue
  } else if (loginStatus === 200) {
    // Possibly remained on login page due to invalid auth
    const text = await loginResp.text();
    if (text.includes("Invalid") || text.includes("error")) {
      summary.errors.push("Login might have failed. Please verify credentials or CAPTCHA.");
      return new Response(JSON.stringify({ success: false, summary }), {
        status: 401,
        headers: { "content-type": "application/json", ...corsHeaders },
      });
    }
  } else {
    summary.errors.push(`Unexpected login status: ${loginStatus}`);
    return new Response(JSON.stringify({ success: false, summary }), {
      status: 500,
      headers: { "content-type": "application/json", ...corsHeaders },
    });
  }

  // 3) Fetch devices page (placeholder path - update after confirmation)
  // Example paths to try: "/Devices.aspx", "/Fleet/Devices.aspx", "/Default.aspx"
  const candidates = ["/Devices.aspx", "/Default.aspx", "/Fleet/Devices.aspx"];
  let devicesHtml = "";
  for (const path of candidates) {
    const r = await fetch(`${TRACKING_BASE}${path}`, { headers: { "Cookie": cookie } });
    if (r.ok) {
      devicesHtml = await r.text();
      if (devicesHtml && devicesHtml.length > 200) {
        break;
      }
    }
  }

  if (!devicesHtml) {
    summary.errors.push("Could not fetch devices page. Please provide the exact devices list URL.");
    return new Response(JSON.stringify({ success: false, summary }), {
      headers: { "content-type": "application/json", ...corsHeaders },
    });
  }

  // 4) Parse devices from HTML (placeholder: expects rows with data attributes)
  // Adjust the parsing to actual HTML structure.
  const parsedDevices = parseDevicesFromHtml(devicesHtml);
  if (parsedDevices.length === 0) {
    summary.errors.push("No devices parsed. Please adjust parser to page structure.");
  } else {
    for (const d of parsedDevices) {
      await processDevice(d);
    }
  }

  return new Response(JSON.stringify({ success: true, summary }), {
    headers: { "content-type": "application/json", ...corsHeaders },
  });
});

// Helpers
function mergeCookies(existing: string, incoming: string | null): string {
  if (!incoming) return existing;
  const parts = incoming.split(",");
  const cookies = parts
    .map((p) => p.split(";")[0].trim())
    .filter(Boolean);
  const jar = new Map<string, string>();
  const add = (c: string) => {
    const [k, v] = c.split("=");
    if (!k) return;
    jar.set(k.trim(), v ?? "");
  };
  // Load existing
  existing.split(";").forEach((c) => {
    const [k, v] = c.trim().split("=");
    if (!k) return;
    jar.set(k.trim(), v ?? "");
  });
  // Add incoming
  cookies.forEach(add);
  return Array.from(jar.entries())
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");
}

function extractHidden(html: string, name: string): string | null {
  const re = new RegExp(`name="${name}"\\s+id="${name}"\\s+value="([^"]*)"`, "i");
  const m = html.match(re);
  return m ? decodeHtml(m[1]) : null;
}

function decodeHtml(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"');
}

function parseDevicesFromHtml(html: string): DeviceInput[] {
  // Placeholder parser:
  // Try to find rows like: <tr data-plate="..." data-tracker="..." data-lat="..." data-lon="..." data-addr="...">
  const re = /<tr[^>]*data-plate="([^"]+)"[^>]*data-tracker="([^"]+)"[^>]*?(?:data-lat="([^"]+)")?[^>]*?(?:data-lon="([^"]+)")?[^>]*?(?:data-addr="([^"]*)")?[^>]*>/gi;
  const out: DeviceInput[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const plate = m[1];
    const trackerId = m[2];
    const latitude = m[3] ? Number(m[3]) : undefined;
    const longitude = m[4] ? Number(m[4]) : undefined;
    const address = m[5] || undefined;
    if (plate && trackerId) {
      out.push({ plate, trackerId, latitude, longitude, address });
    }
  }
  return out;
}
