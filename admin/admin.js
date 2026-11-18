import { demo, getReplies, ownerSession, signIn, signOut } from "../api.js";
import { activities, formatDate } from "../options.js";

const get = (id) => document.getElementById(id);
const login = get("login");
const logout = get("sign-out");
const status = get("status");
const content = get("content");
const detailPage = location.pathname.endsWith("/response.html");
const id = new URLSearchParams(location.search).get("id");
const uuid = /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i;
get("local-note").hidden = !demo;

function row(reply) {
  const link = document.createElement("a");
  const info = document.createElement("div");
  const title = document.createElement("strong");
  const subtitle = document.createElement("p");
  const arrow = document.createElement("span");
  link.href = "./response.html?id=" + encodeURIComponent(reply.id);
  link.className = "response";
  title.textContent = activities[reply.activity].label + " · " + reply.detail;
  subtitle.textContent = formatDate(reply.date);
  arrow.textContent = "→";
  arrow.setAttribute("aria-hidden", "true");
  info.append(title, subtitle);
  link.append(info, arrow);
  return link;
}

function details(reply) {
  const list = document.createElement("dl");
  const activity = activities[reply.activity];
  const fields = [
    ["Activity", activity.label],
    [activity.detail, reply.detail],
    ["Date", formatDate(reply.date)],
    ["Received", new Intl.DateTimeFormat("en", {
      dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Baku",
    }).format(new Date(reply.created_at)) + " (Baku)"],
  ];
  for (const [label, value] of fields) {
    const term = document.createElement("dt");
    const description = document.createElement("dd");
    term.textContent = label;
    description.textContent = value;
    list.append(term, description);
  }
  return list;
}

async function render() {
  content.replaceChildren();
  const signedIn = !demo && Boolean(ownerSession());
  login.hidden = demo || signedIn;
  logout.hidden = !signedIn;
  status.textContent = "";
  if (!demo && !signedIn) return;
  if (detailPage && !uuid.test(id || "")) {
    status.textContent = "This reply link is incomplete.";
    return;
  }
  status.textContent = "Loading…";
  try {
    const replies = await getReplies(detailPage ? id : undefined);
    if (!demo && !ownerSession()) return;
    status.textContent = replies.length ? "" : detailPage ? "Reply not found." : "No replies yet.";
    if (replies.length) {
      if (detailPage) content.append(details(replies[0]));
      else content.append(...replies.map(row));
    }
  } catch (error) {
    if (error.status === 401) {
      signOut();
      await render();
      status.textContent = "Your session expired. Please sign in again.";
    } else {
      status.textContent = "Couldn’t load replies. Refresh to try again.";
    }
  }
}

login.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = login.querySelector("button");
  button.disabled = true;
  status.textContent = "Signing in…";
  try {
    await signIn(get("email").value.trim(), get("password").value);
    login.reset();
    await render();
  } catch {
    status.textContent = "Couldn’t sign in. Check your credentials and configuration.";
  } finally {
    button.disabled = false;
  }
});

logout.addEventListener("click", () => {
  signOut();
  render();
});

window.addEventListener("pageshow", render);
