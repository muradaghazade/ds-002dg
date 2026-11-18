import { supabaseUrl, supabasePublishableKey } from "./config.js";

export const demo = !supabaseUrl.trim() && !supabasePublishableKey.trim();
const demoKey = "little-date:demo-responses";
const sessionKey = "little-date:owner:" + supabaseUrl;

async function request(path, { jwt, headers, ...options } = {}) {
  if (!supabaseUrl.trim() || !supabasePublishableKey.trim()) {
    throw new Error("Fill in both Supabase settings in config.js.");
  }
  const response = await fetch(new URL(path, supabaseUrl), {
    ...options,
    signal: AbortSignal.timeout(15000),
    headers: {
      apikey: supabasePublishableKey,
      ...(jwt ? { Authorization: "Bearer " + jwt } : {}),
      ...headers,
    },
  });
  if (!response.ok) {
    const error = new Error("The server could not complete the request.");
    error.status = response.status;
    throw error;
  }
  if (response.status !== 204 && response.headers.get("content-type")?.includes("json")) {
    return response.json();
  }
}

function demoReplies() {
  return JSON.parse(localStorage.getItem(demoKey) || "[]");
}

export async function submitReply(reply) {
  if (demo) {
    const replies = demoReplies();
    if (!replies.some((item) => item.id === reply.id)) {
      replies.unshift({ ...reply, created_at: new Date().toISOString() });
      localStorage.setItem(demoKey, JSON.stringify(replies));
    }
    return;
  }
  await request("/rest/v1/rpc/submit_date_reply", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      reply_id: reply.id,
      reply_activity: reply.activity,
      reply_detail: reply.detail,
      reply_date: reply.date,
    }),
  });
}

export function ownerSession() {
  const session = JSON.parse(sessionStorage.getItem(sessionKey) || "null");
  return session?.expires_at > Date.now() / 1000 ? session : null;
}

export async function signIn(email, password) {
  const session = await request("/auth/v1/token?grant_type=password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  sessionStorage.setItem(sessionKey, JSON.stringify({
    access_token: session.access_token,
    expires_at: session.expires_at ?? Date.now() / 1000 + session.expires_in,
  }));
}

export function signOut() {
  sessionStorage.removeItem(sessionKey);
}

export async function getReplies(id) {
  if (demo) return demoReplies().filter((reply) => !id || reply.id === id);
  const session = ownerSession();
  if (!session) throw new Error("Sign in to view replies.");
  const params = new URLSearchParams({
    select: "id,activity,detail,date,created_at",
    order: "created_at.desc",
  });
  if (id) params.set("id", "eq." + id);
  return request("/rest/v1/date_replies?" + params, { jwt: session.access_token });
}
