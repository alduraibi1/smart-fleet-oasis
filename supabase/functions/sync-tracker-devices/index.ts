
/* eslint-disable */
// Deno Edge Function: sync-tracker-devices
// Modes:
// - auto   : Login to tracking site and fetch devices (with improved discovery & parsing)
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

  // =========================
  // AUTO MODE (improved)
  // =========================
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
  console.log("[sync-tracker] Fetching login page...");
  const loginPageResp = await fetch(`${TRACKING_BASE}${LOGIN_PATH}`);
  cookie = mergeCookies(cookie, loginPageResp.headers.get("set-cookie"));
  const loginHtml = await loginPageResp.text();
  const hiddenFields = extractAspNetHiddenFields(loginHtml);
  const userFieldName = findInputName(loginHtml, ["UserName", "username", "txtUserName", "Login1$UserName", "ctl00$ContentPlaceHolder1$txtUserName"]);
  const passFieldName = findInputName(loginHtml, ["Password", "password", "txtPassword", "Login1$Password", "ctl00$ContentPlaceHolder1$txtPassword"]);
  const submitFieldName = findInputName(loginHtml, ["btnLogin", "LoginButton", "ctl00$ContentPlaceHolder1$btnLogin"], true) || "btnLogin";

  // 2) Post login form
  const form = new URLSearchParams();
  // Hidden ASP.NET fields
  Object.entries(hiddenFields).forEach(([k, v]) => {
    if (v !== undefined && v !== null) form.set(k, v);
  });

  // Credentials: try detected names then common fallbacks
  form.set(userFieldName || "txtUserName", username);
  form.set(passFieldName || "txtPassword", password);
  form.set(submitFieldName, "Login");

  console.log("[sync-tracker] Posting login...");
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
  console.log("[sync-tracker] Login status:", loginStatus);

  if (loginStatus >= 300 && loginStatus < 400) {
    // redirected after successful login: continue
    console.log("[sync-tracker] Login likely successful (redirect).");
  } else if (loginStatus === 200) {
    // Possibly remained on login page due to invalid auth
    const text = await loginResp.text();
    if (text.includes("Invalid") || text.includes("error") || text.match(/Password|UserName|اسم المستخدم|كلمة المرور/i)) {
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

  // 3) Discover a devices list page
  // Try common landings first
  const homeCandidates = ["/Default.aspx", "/", "/Home.aspx", "/Dashboard.aspx"];
  let homeHtml = "";
  for (const path of homeCandidates) {
    try {
      const r = await fetch(`${TRACKING_BASE}${path}`, { headers: { "Cookie": cookie } });
      if (r.ok) {
        const t = await r.text();
        if (t && t.length > 100) {
          homeHtml = t;
          break;
        }
      }
    } catch (e) {
      console.log("[sync-tracker] Home fetch error for", path, e);
    }
  }

  let candidates = [
    "/Devices.aspx",
    "/Default.aspx",
    "/Fleet/Devices.aspx",
    "/VehicleList.aspx",
    "/Tracking/Devices.aspx",
    "/Assets.aspx",
  ];

  // Discover additional candidates from homepage links (English/Arabic hints)
  if (homeHtml) {
    const discovered = discoverDevicesLinks(homeHtml)
      .map((href) => normalizeHref(href))
      .filter(Boolean) as string[];
    candidates = Array.from(new Set([...discovered, ...candidates]));
    console.log("[sync-tracker] Discovered device page candidates:", candidates);
  }

  // 4) Fetch devices page by trying candidates
  let devicesHtml = "";
  for (const path of candidates) {
    try {
      const url = path.startsWith("http") ? path : `${TRACKING_BASE}${path}`;
      const r = await fetch(url, { headers: { "Cookie": cookie } });
      if (r.ok) {
        const t = await r.text();
        // Heuristic: look for plate/IMEI/device patterns to accept this page
        if (t && t.length > 200 && /plate|imei|device|tracker|لوحة|رقم|جهاز|تتبع/i.test(t)) {
          devicesHtml = t;
          console.log("[sync-tracker] Using devices page:", url);
          break;
        }
      }
    } catch (e) {
      console.log("[sync-tracker] Devices fetch error for", path, e);
    }
  }

  if (!devicesHtml) {
    summary.errors.push("Could not fetch devices page. Please provide the exact devices list URL.");
    return new Response(JSON.stringify({ success: false, summary }), {
      headers: { "content-type": "application/json", ...corsHeaders },
    });
  }

  // 5) Parse devices from HTML using improved parser
  const parsedDevices = parseDevicesFromHtml(devicesHtml);
  console.log("[sync-tracker] Parsed devices count:", parsedDevices.length);

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

// =========================
// Helpers
// =========================
function mergeCookies(existing: string, incoming: string | null): string {
  if (!incoming) return existing;
  // More tolerant merging: split by comma only when a new cookie starts (key=value;...)
  const incomingParts = incoming
    .split(/,(?=\s*[A-Za-z0-9_\-]+=)/g)
    .map((p) => p.split(";")[0].trim())
    .filter(Boolean);

  const jar = new Map<string, string>();

  // Load existing
  existing.split(";").forEach((c) => {
    const [k, v] = c.trim().split("=");
    if (!k) return;
    jar.set(k.trim(), v ?? "");
  });

  // Add incoming
  incomingParts.forEach((c) => {
    const [k, v] = c.split("=");
    if (!k) return;
    jar.set(k.trim(), v ?? "");
  });

  return Array.from(jar.entries())
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");
}

function decodeHtml(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"');
}

function extractAspNetHiddenFields(html: string): Record<string, string> {
  const names = ["__VIEWSTATE", "__EVENTVALIDATION", "__VIEWSTATEGENERATOR"];
  const out: Record<string, string> = {};
  for (const n of names) {
    const re = new RegExp(`name="${n}"[^>]*value="([^"]*)"`, "i");
    const m = html.match(re);
    if (m) out[n] = decodeHtml(m[1]);
  }
  // Also include any __EVENTTARGET/ARGUMENT if preset
  const et = html.match(/name="__EVENTTARGET"[^>]*value="([^"]*)"/i)?.[1];
  const ea = html.match(/name="__EVENTARGUMENT"[^>]*value="([^"]*)"/i)?.[1];
  if (et) out["__EVENTTARGET"] = decodeHtml(et);
  if (ea) out["__EVENTARGUMENT"] = decodeHtml(ea);
  return out;
}

function findInputName(html: string, candidates: string[], exact = false): string | null {
  // Try to detect input names (name or id) present in page that match any candidate
  for (const cand of candidates) {
    const re = exact
      ? new RegExp(`name="${escapeRegex(cand)}"|id="${escapeRegex(cand)}"`, "i")
      : new RegExp(`name="([^"]*${escapeRegex(cand)}[^"]*)"|id="([^"]*${escapeRegex(cand)}[^"]*)"`, "i");
    const m = html.match(re);
    if (m) {
      const full = m[1] || m[2];
      return full || cand;
    }
  }
  return null;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeHref(href: string): string {
  try {
    if (!href) return "";
    // Ignore javascript:void
    if (/^javascript:/i.test(href)) return "";
    // Return as-is if absolute
    if (/^https?:\/\//i.test(href)) return href;
    // Ensure starts with slash
    if (!href.startsWith("/")) return `/${href}`;
    return href;
  } catch {
    return "";
  }
}

function discoverDevicesLinks(html: string): string[] {
  const out = new Set<string>();
  const re = /<a\s+[^>]*href="([^"]+)"[^>]*>(.*?)<\/a>/gis;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const href = m[1] || "";
    const text = stripTags(m[2] || "");
    // Heuristics in both EN/AR
    if (
      /device|devices|tracker|vehicle|fleet|asset|IMEI|GPS|تتبع|جهاز|أجهزة|مركبة|المركبات|الأسطول/i.test(href + " " + text)
    ) {
      out.add(href);
    }
  }
  return Array.from(out);
}

function stripTags(s: string): string {
  return s.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

function cellText(html: string): string {
  return stripTags(decodeHtml(html)).trim();
}

// Improved parser: combine attribute-based and table-based parsing
function parseDevicesFromHtml(html: string): DeviceInput[] {
  const results: DeviceInput[] = [];

  // A) Attribute-based rows
  const attrRe =
    /<tr[^>]*data-plate="([^"]+)"[^>]*data-tracker="([^"]+)"[^>]*?(?:data-lat="([^"]+)")?[^>]*?(?:data-lon="([^"]+)")?[^>]*?(?:data-addr="([^"]*)")?[^>]*>/gi;
  let a: RegExpExecArray | null;
  while ((a = attrRe.exec(html)) !== null) {
    const plate = a[1];
    const trackerId = a[2];
    const latitude = a[3] ? Number(a[3]) : undefined;
    const longitude = a[4] ? Number(a[4]) : undefined;
    const address = a[5] || undefined;
    if (plate && trackerId) {
      results.push({ plate, trackerId, latitude, longitude, address });
    }
  }

  // B) Table-based parsing with header detection (EN/AR)
  // Find first table that looks like a devices list (has plate/tracker headers)
  const tableRe = /<table[^>]*>([\s\S]*?)<\/table>/gi;
  let t: RegExpExecArray | null;
  while ((t = tableRe.exec(html)) !== null) {
    const table = t[1];

    // Find header row
    const headerRowMatch = table.match(/<tr[^>]*>([\s\S]*?)<\/tr>/i);
    if (!headerRowMatch) continue;
    const headerRow = headerRowMatch[1];

    const headers = Array.from(headerRow.matchAll(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi)).map((m) =>
      cellText(m[1])
    );
    if (headers.length === 0) continue;

    // Identify columns
    const colIndex = {
      plate: findHeaderIndex(headers, ["plate", "لوحة", "رقم اللوحة", "plate number", "vehicle", "المركبة"]),
      tracker: findHeaderIndex(headers, ["tracker", "imei", "device", "جهاز", "المتتبع"]),
      lat: findHeaderIndex(headers, ["lat", "latitude", "خط العرض", "إحداثيات"]),
      lon: findHeaderIndex(headers, ["lon", "lng", "longitude", "خط الطول"]),
      addr: findHeaderIndex(headers, ["address", "العنوان", "location", "الموقع"]),
    };

    // Need at least plate + tracker columns
    if (colIndex.plate === -1 || colIndex.tracker === -1) continue;

    // Iterate data rows (all rows after header)
    const rowRe = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    let rr: RegExpExecArray | null;
    // Skip first match (header) by advancing once
    rowRe.exec(table);
    while ((rr = rowRe.exec(table)) !== null) {
      const rowHtml = rr[1];
      const cells = Array.from(rowHtml.matchAll(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi)).map((m) => cellText(m[1]));
      if (cells.length < Math.max(colIndex.plate, colIndex.tracker) + 1) continue;

      const plate = cells[colIndex.plate]?.trim();
      const trackerId = cells[colIndex.tracker]?.trim();
      const latitude = colIndex.lat !== -1 ? parseNumberSafe(cells[colIndex.lat]) : undefined;
      const longitude = colIndex.lon !== -1 ? parseNumberSafe(cells[colIndex.lon]) : undefined;
      const address = colIndex.addr !== -1 ? (cells[colIndex.addr] || undefined) : undefined;

      if (plate && trackerId) {
        results.push({ plate, trackerId, latitude, longitude, address });
      }
    }

    // If we found any in this table, accept and stop scanning more tables to avoid duplicates
    if (results.length > 0) break;
  }

  // Deduplicate by plate+trackerId
  const uniq = new Map<string, DeviceInput>();
  for (const d of results) {
    const key = `${d.plate}::${d.trackerId}`;
    if (!uniq.has(key)) uniq.set(key, d);
  }
  return Array.from(uniq.values());
}

function parseNumberSafe(s?: string): number | undefined {
  if (!s) return undefined;
  const n = Number(String(s).replace(/[^\d.\-]/g, ""));
  return isFinite(n) ? n : undefined;
}

function findHeaderIndex(headers: string[], keys: string[]): number {
  const normalized = headers.map((h) => h.toLowerCase());
  for (const k of keys) {
    const kk = k.toLowerCase();
    // Exact or contains
    let i = normalized.findIndex((h) => h === kk);
    if (i !== -1) return i;
    i = normalized.findIndex((h) => h.includes(kk));
    if (i !== -1) return i;
  }
  return -1;
}
