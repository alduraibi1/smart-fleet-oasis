/* eslint-disable */
// Deno Edge Function: sync-tracker-devices
// Enhanced version with improved Arabic normalization and fuzzy matching

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
  dryRun?: boolean;
};

type MatchSuggestion = {
  vehicleId: string;
  plate: string;
  score: number;
  reason: string;
};

type UnmatchedSuggestion = {
  devicePlate: string;
  normalizedPlate: string;
  topCandidates: MatchSuggestion[];
};

type Summary = {
  matched: number;
  updatedVehicles: number;
  upsertedMappings: number;
  updatedLocations: number;
  skipped: number;
  errors: string[];
  mode: "auto" | "manual";
  dryRun?: boolean;
  discoveredDevices?: DeviceInput[];
  unmatchedSuggestions?: UnmatchedSuggestion[];
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
  const dryRun = body.dryRun ?? false;

  const summary: Summary = {
    matched: 0,
    updatedVehicles: 0,
    upsertedMappings: 0,
    updatedLocations: 0,
    skipped: 0,
    errors: [],
    mode,
    dryRun,
    discoveredDevices: [],
    unmatchedSuggestions: [],
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

  // Enhanced Arabic normalization function
  const normalizePlate = (plate?: string): string => {
    if (!plate) return "";
    
    let normalized = plate.trim();
    
    // Remove diacritics and tatweel
    normalized = normalized.replace(/[\u064B-\u0652\u0640]/g, "");
    
    // Normalize Arabic letters (comprehensive mapping)
    const arabicMap: Record<string, string> = {
      // Alef variations
      "أ": "ا", "إ": "ا", "آ": "ا", "ٱ": "ا",
      // Yeh variations
      "ى": "ي", "ئ": "ي",
      // Waw variations
      "ؤ": "و",
      // Teh marbuta (careful mapping)
      "ة": "ه"
    };
    
    // Apply Arabic character normalization
    for (const [variant, standard] of Object.entries(arabicMap)) {
      normalized = normalized.replace(new RegExp(variant, 'g'), standard);
    }
    
    // Convert Arabic digits to Western
    const digitMap: Record<string, string> = {
      "٠": "0", "١": "1", "٢": "2", "٣": "3", "٤": "4",
      "٥": "5", "٦": "6", "٧": "7", "٨": "8", "٩": "9"
    };
    
    for (const [arabic, western] of Object.entries(digitMap)) {
      normalized = normalized.replace(new RegExp(arabic, 'g'), western);
    }
    
    // Latin to Arabic conversion (common mistyping fixes)
    const latinToArabicMap: Record<string, string> = {
      "A": "ا", "B": "ب", "J": "ج", "D": "د", "R": "ر",
      "S": "س", "T": "ط", "H": "ح", "W": "و", "Y": "ي"
    };
    
    for (const [latin, arabic] of Object.entries(latinToArabicMap)) {
      normalized = normalized.replace(new RegExp(latin, 'gi'), arabic);
    }
    
    // Keep only Arabic letters and digits
    normalized = normalized.replace(/[^ا-ي0-9]/g, "");
    
    return normalized;
  };

  // Levenshtein distance calculation
  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix: number[][] = [];
    const len1 = str1.length;
    const len2 = str2.length;

    if (len1 === 0) return len2;
    if (len2 === 0) return len1;

    // Initialize matrix
    for (let i = 0; i <= len1; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j;
    }

    // Fill matrix
    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,     // deletion
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j - 1] + cost // substitution
        );
      }
    }

    return matrix[len1][len2];
  };

  // Fuzzy matching function
  const findFuzzyMatches = (devicePlate: string, normalizedDevicePlate: string, vehicles: any[]): MatchSuggestion[] => {
    const candidates: MatchSuggestion[] = [];
    
    for (const vehicle of vehicles) {
      const normalizedVehiclePlate = normalizePlate(vehicle.plate_number);
      
      if (normalizedVehiclePlate.length === 0) continue;
      
      const distance = levenshteinDistance(normalizedDevicePlate, normalizedVehiclePlate);
      const maxLen = Math.max(normalizedDevicePlate.length, normalizedVehiclePlate.length);
      
      if (maxLen === 0) continue;
      
      let score = 1 - (distance / maxLen);
      let reason = "";
      
      // Boost score for digit matches
      const deviceDigits = normalizedDevicePlate.match(/\d/g) || [];
      const vehicleDigits = normalizedVehiclePlate.match(/\d/g) || [];
      const digitMatch = deviceDigits.join("") === vehicleDigits.join("");
      
      if (digitMatch && deviceDigits.length > 0) {
        score += 0.2;
        reason = "الأرقام متطابقة";
      }
      
      // Boost for prefix/suffix matches
      if (normalizedDevicePlate.startsWith(normalizedVehiclePlate.substring(0, 3)) ||
          normalizedDevicePlate.endsWith(normalizedVehiclePlate.substring(-3))) {
        score += 0.1;
        reason = reason ? reason + "، تطابق جزئي" : "تطابق في البداية/النهاية";
      }
      
      // Only consider if score is reasonable and distance is small
      if (score >= 0.6 && distance <= 3) {
        if (distance === 1) {
          reason = reason ? reason + "، اختلاف حرف واحد" : "اختلاف حرف واحد فقط";
        } else if (distance === 2) {
          reason = reason ? reason + "، اختلاف حرفين" : "اختلاف حرفين";
        }
        
        candidates.push({
          vehicleId: vehicle.id,
          plate: vehicle.plate_number,
          score: Math.min(score, 1.0),
          reason: reason || `تشابه ${Math.round(score * 100)}%`
        });
      }
    }
    
    // Sort by score descending and return top 3
    return candidates
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  };

  // Build normalized plate index for exact matching
  const plateIndex = new Map<string, { id: string; plate: string }>();
  for (const v of vehicles ?? []) {
    const normalized = normalizePlate(v.plate_number);
    if (normalized) {
      plateIndex.set(normalized, { id: v.id, plate: v.plate_number });
    }
  }

  // Helper to process a single device record
  const processDevice = async (d: DeviceInput) => {
    const normalizedDevice = normalizePlate(d.plate);
    const exactMatch = plateIndex.get(normalizedDevice);

    if (exactMatch) {
      summary.matched += 1;

      if (dryRun) {
        console.log(`[DRY RUN] Would process device: ${d.plate} -> ${d.trackerId}`);
        return;
      }

      // Continue with existing update logic for exact matches
      const { error: updErr } = await supabase
        .from("vehicles")
        .update({ tracker_id: d.trackerId })
        .eq("id", exactMatch.id);

      if (!updErr) {
        summary.updatedVehicles += 1;
      } else {
        summary.errors.push(`Failed to update vehicle tracker_id for ${d.plate}: ${updErr.message}`);
      }

      const { error: mapErr } = await supabase
        .from("vehicle_tracker_mappings")
        .upsert({
          vehicle_id: exactMatch.id,
          tracker_id: d.trackerId,
          plate_number: exactMatch.plate,
          last_sync: new Date().toISOString(),
          sync_status: "active",
        }, { onConflict: "vehicle_id" });

      if (!mapErr) {
        summary.upsertedMappings += 1;
      } else {
        summary.errors.push(`Failed upsert mapping for ${d.plate}: ${mapErr.message}`);
      }

      if (typeof d.latitude === "number" && typeof d.longitude === "number") {
        const { data: locRows, error: locSelErr } = await supabase
          .from("vehicle_location")
          .select("id")
          .eq("vehicle_id", exactMatch.id)
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
              vehicle_id: exactMatch.id,
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
    } else {
      // No exact match found - try fuzzy matching
      const fuzzyMatches = findFuzzyMatches(d.plate, normalizedDevice, vehicles ?? []);
      
      if (fuzzyMatches.length > 0) {
        summary.unmatchedSuggestions?.push({
          devicePlate: d.plate,
          normalizedPlate: normalizedDevice,
          topCandidates: fuzzyMatches
        });
        
        console.log(`[FUZZY] Found ${fuzzyMatches.length} suggestions for ${d.plate}:`, 
          fuzzyMatches.map(m => `${m.plate}(${m.score.toFixed(2)})`).join(", "));
      } else {
        summary.errors.push(`No vehicle match found for plate: ${d.plate} (normalized: ${normalizedDevice})`);
      }
      
      summary.skipped += 1;
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
  // AUTO MODE (Enhanced with proper URL handling)
  // =========================

  // Get tracking configuration from Supabase secrets - Fixed URL handling
  const TRACKING_BASE = Deno.env.get("TRACKING_BASE_URL") || "http://194.165.139.226";
  const LOGIN_PATH = Deno.env.get("TRACKING_LOGIN_PATH") || "/Login.aspx";
  const DEVICES_PATH = Deno.env.get("TRACKING_DEVICES_PATH");
  
  const username = Deno.env.get("TRACKING_USERNAME");
  const password = Deno.env.get("TRACKING_PASSWORD");

  if (!username || !password) {
    summary.errors.push("Tracking credentials not configured: TRACKING_USERNAME / TRACKING_PASSWORD");
    return new Response(JSON.stringify({ success: false, summary }), {
      status: 200,
      headers: { "content-type": "application/json", ...corsHeaders },
    });
  }

  console.log(`[sync-tracker] Using base URL: ${TRACKING_BASE}`);
  console.log(`[sync-tracker] Using login path: ${LOGIN_PATH}`);
  if (DEVICES_PATH) {
    console.log(`[sync-tracker] Using configured devices path: ${DEVICES_PATH}`);
  }

  // Basic cookie jar
  let cookie = "";

  try {
    console.log("[sync-tracker] Fetching login page...");
    // Build login URL robustly (supports absolute LOGIN_PATH and base with path)
    const loginUrl = buildUrl(TRACKING_BASE, LOGIN_PATH);
    console.log(`[sync-tracker] Computed login URL: ${loginUrl}`);
    const loginPageResp = await fetch(loginUrl);
    cookie = mergeCookies(cookie, loginPageResp.headers.get("set-cookie"));
    const loginHtml = await loginPageResp.text();
    
    const hiddenFields = extractAspNetHiddenFields(loginHtml);
    const userFieldName = findInputName(loginHtml, ["UserName", "username", "txtUserName", "Login1$UserName", "ctl00$ContentPlaceHolder1$txtUserName"]);
    const passFieldName = findInputName(loginHtml, ["Password", "password", "txtPassword", "Login1$Password", "ctl00$ContentPlaceHolder1$txtPassword"]);
    const submitFieldName = findInputName(loginHtml, ["btnLogin", "LoginButton", "ctl00$ContentPlaceHolder1$btnLogin"], true) || "btnLogin";

    const form = new URLSearchParams();
    Object.entries(hiddenFields).forEach(([k, v]) => {
      if (v !== undefined && v !== null) form.set(k, v);
    });

    form.set(userFieldName || "txtUserName", username);
    form.set(passFieldName || "txtPassword", password);
    form.set(submitFieldName, "Login");

    console.log("[sync-tracker] Posting login...");
    const loginResp = await fetch(loginUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Cookie": cookie,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      body: form.toString(),
      redirect: "manual",
    });
    
    cookie = mergeCookies(cookie, loginResp.headers.get("set-cookie"));
    const loginStatus = loginResp.status;
    console.log("[sync-tracker] Login status:", loginStatus);

    if (loginStatus >= 300 && loginStatus < 400) {
      console.log("[sync-tracker] Login successful (redirect detected).");
    } else if (loginStatus === 200) {
      const text = await loginResp.text();
      if (text.includes("Invalid") || text.includes("error") || text.match(/Password|UserName|اسم المستخدم|كلمة المرور/i)) {
        summary.errors.push("Login failed. Please verify credentials.");
        return new Response(JSON.stringify({ success: false, summary }), {
          status: 200,
          headers: { "content-type": "application/json", ...corsHeaders },
        });
      }
    } else {
      summary.errors.push(`Unexpected login status: ${loginStatus}`);
      return new Response(JSON.stringify({ success: false, summary }), {
        status: 200,
        headers: { "content-type": "application/json", ...corsHeaders },
      });
    }

    let devicesHtml = "";
    
    if (DEVICES_PATH) {
      console.log(`[sync-tracker] Using configured devices path: ${DEVICES_PATH}`);
      const devicesUrl = /^https?:\/\//i.test(DEVICES_PATH) ? DEVICES_PATH : buildUrl(TRACKING_BASE, DEVICES_PATH);
      console.log(`[sync-tracker] Computed devices URL: ${devicesUrl}`);
      const devicesResp = await fetch(devicesUrl, {
        headers: { 
          "Cookie": cookie,
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        }
      });
      
      if (devicesResp.ok) {
        devicesHtml = await devicesResp.text();
      } else {
        summary.errors.push(`Failed to fetch configured devices page: ${devicesResp.status}`);
      }
    }
    
    if (!devicesHtml) {
      console.log("[sync-tracker] Auto-discovering devices page...");
      
      const homeCandidates = ["/Default.aspx", "/", "/Home.aspx", "/Dashboard.aspx"];
      let homeHtml = "";
      
      for (const path of homeCandidates) {
        try {
          const r = await fetch(buildUrl(TRACKING_BASE, path), { 
            headers: { 
              "Cookie": cookie,
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            }
          });
          if (r.ok) {
            const t = await r.text();
            if (t && t.length > 100) {
              homeHtml = t;
              console.log(`[sync-tracker] Found home page: ${path}`);
              break;
            }
          }
        } catch (e) {
          console.log(`[sync-tracker] Home fetch error for ${path}:`, e);
        }
      }

      let candidates = [
        "/Devices.aspx",
        "/Default.aspx", 
        "/Fleet/Devices.aspx",
        "/VehicleList.aspx",
        "/Tracking/Devices.aspx",
        "/Assets.aspx",
        "/Reports/Devices.aspx",
        "/Admin/Devices.aspx"
      ];

      if (homeHtml) {
        const discovered = discoverDevicesLinks(homeHtml)
          .map((href) => normalizeHref(href))
          .filter(Boolean) as string[];
        candidates = Array.from(new Set([...discovered, ...candidates]));
        console.log("[sync-tracker] Discovered device page candidates:", discovered);
      }

      for (const path of candidates) {
        try {
          const url = /^https?:\/\//i.test(path) ? path : buildUrl(TRACKING_BASE, path);
          const r = await fetch(url, { 
            headers: { 
              "Cookie": cookie,
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            }
          });
          
          if (r.ok) {
            const t = await r.text();
            if (t && t.length > 200 && /plate|imei|device|tracker|لوحة|رقم|جهاز|تتبع/i.test(t)) {
              devicesHtml = t;
              console.log(`[sync-tracker] Using devices page: ${url}`);
              break;
            }
          }
        } catch (e) {
          console.log(`[sync-tracker] Devices fetch error for ${path}:`, e);
        }
      }
    }

    if (!devicesHtml) {
      summary.errors.push("Could not fetch devices page. Please configure TRACKING_DEVICES_PATH secret with the correct path.");
      return new Response(JSON.stringify({ success: false, summary }), {
        headers: { "content-type": "application/json", ...corsHeaders },
      });
    }

    const parsedDevices = parseDevicesFromHtml(devicesHtml);
    console.log(`[sync-tracker] Parsed ${parsedDevices.length} devices`);
    
    summary.discoveredDevices = parsedDevices;

    if (parsedDevices.length === 0) {
      summary.errors.push("No devices parsed from the page. The page structure may have changed.");
    } else if (dryRun) {
      console.log("[DRY RUN] Would process devices:", parsedDevices);
    } else {
      for (const d of parsedDevices) {
        await processDevice(d);
      }
    }

  } catch (error) {
    console.error("[sync-tracker] Error during auto sync:", error);
    summary.errors.push(`Auto sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return new Response(JSON.stringify({ success: false, summary }), {
      status: 500,
      headers: { "content-type": "application/json", ...corsHeaders },
    });
  }

  // Before returning the final response, print a summary for debugging
  console.log("[sync-tracker] Final summary:", JSON.stringify(summary));

  return new Response(JSON.stringify({ success: true, summary }), {
    headers: { "content-type": "application/json", ...corsHeaders },
  });
});

// =========================
// Helper Functions
// =========================

// Safely build URLs from base + path, handling absolute paths and bases that include paths.
function buildUrl(base: string, path: string): string {
  try {
    if (!path) return base;
    if (/^https?:\/\//i.test(path)) return path;

    const baseUrl = new URL(base);
    const origin = `${baseUrl.protocol}//${baseUrl.host}`;
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return origin + normalizedPath;
  } catch {
    // Fallback concatenation if URL parsing fails
    const sep = base.endsWith("/") || path.startsWith("/") ? "" : "/";
    return `${base}${sep}${path}`;
  }
}

function mergeCookies(existing: string, incoming: string | null): string {
  if (!incoming) return existing;
  const incomingParts = incoming
    .split(/,(?=\s*[A-Za-z0-9_\-]+=)/g)
    .map((p) => p.split(";")[0].trim())
    .filter(Boolean);

  const jar = new Map<string, string>();

  existing.split(";").forEach((c) => {
    const [k, v] = c.trim().split("=");
    if (!k) return;
    jar.set(k.trim(), v ?? "");
  });

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
  const names = ["__VIEWSTATE", "__EVENTVALIDATION", "__VIEWSTATEGENERATOR", "__EVENTTARGET", "__EVENTARGUMENT"];
  const out: Record<string, string> = {};
  
  for (const n of names) {
    const re = new RegExp(`name="${n}"[^>]*value="([^"]*)"`, "i");
    const m = html.match(re);
    if (m) out[n] = decodeHtml(m[1]);
  }
  
  return out;
}

function findInputName(html: string, candidates: string[], exact = false): string | null {
  for (const cand of candidates) {
    const re = exact
      ? new RegExp(`name="${escapeRegex(cand)}"|id="${escapeRegex(cand)}"`, "i")
      : new RegExp(`name="([^"]*${escapeRegex(cand)}[^"]*)"|id="([^"]*${escapeRegex(cand)}[^"]*)"`, "i");
    const m = html.match(re);
    if (m) {
      return m[1] || m[2] || cand;
    }
  }
  return null;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeHref(href: string): string {
  try {
    if (!href || /^javascript:/i.test(href)) return "";
    if (/^https?:\/\//i.test(href)) return href;
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
    if (/device|devices|tracker|vehicle|fleet|asset|IMEI|GPS|تتبع|جهاز|أجهزة|مركبة|المركبات|الأسطول/i.test(href + " " + text)) {
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

function parseDevicesFromHtml(html: string): DeviceInput[] {
  const results: DeviceInput[] = [];

  const attrRe = /<tr[^>]*data-plate="([^"]+)"[^>]*data-tracker="([^"]+)"[^>]*?(?:data-lat="([^"]+)")?[^>]*?(?:data-lon="([^"]+)")?[^>]*?(?:data-addr="([^"]*)")?[^>]*>/gi;
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

  const tableRe = /<table[^>]*>([\s\S]*?)<\/table>/gi;
  let t: RegExpExecArray | null;
  
  while ((t = tableRe.exec(html)) !== null) {
    const table = t[1];
    const headerRowMatch = table.match(/<tr[^>]*>([\s\S]*?)<\/tr>/i);
    if (!headerRowMatch) continue;
    
    const headerRow = headerRowMatch[1];
    const headers = Array.from(headerRow.matchAll(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi))
      .map((m) => cellText(m[1]));
    
    if (headers.length === 0) continue;

    const colIndex = {
      plate: findHeaderIndex(headers, ["plate", "لوحة", "رقم اللوحة", "plate number", "vehicle", "المركبة"]),
      tracker: findHeaderIndex(headers, ["tracker", "imei", "device", "جهاز", "المتتبع", "رقم الجهاز"]),
      lat: findHeaderIndex(headers, ["lat", "latitude", "خط العرض", "إحداثيات"]),
      lon: findHeaderIndex(headers, ["lon", "lng", "longitude", "خط الطول"]),
      addr: findHeaderIndex(headers, ["address", "العنوان", "location", "الموقع"]),
    };

    if (colIndex.plate === -1 || colIndex.tracker === -1) continue;

    const rowRe = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    let rr: RegExpExecArray | null;
    rowRe.exec(table);
    
    while ((rr = rowRe.exec(table)) !== null) {
      const rowHtml = rr[1];
      const cells = Array.from(rowHtml.matchAll(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi))
        .map((m) => cellText(m[1]));
      
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

    if (results.length > 0) break;
  }

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
    let i = normalized.findIndex((h) => h === kk);
    if (i !== -1) return i;
    i = normalized.findIndex((h) => h.includes(kk));
    if (i !== -1) return i;
  }
  return -1;
}
