import { submitReply } from "./api.js";
import { activities, formatDate } from "./options.js";
import { movies } from "./movies.js";
import { calendar } from "./calendar.js";

const get = (id) => document.getElementById(id);
const no = get("no");
const welcome = get("welcome");
const planner = get("planner");
const back = get("back");
const send = get("send");
const status = get("submit-status");
const sections = [get("activity-step"), get("detail-step"), get("date-step")];

let step = 0;
let activity;
let detailInput;
let choiceGroup;
let pendingReply;
let dodgeFrame = 0;
let dodgeTarget;
let lastFrame;

function resetDodge() {
  cancelAnimationFrame(dodgeFrame);
  dodgeFrame = 0;
  dodgeTarget = lastFrame = undefined;
  no.classList.remove("moving");
}

function showStep(next) {
  step = next;
  sections.forEach((section, index) => {
    section.hidden = index !== next;
    section.querySelectorAll("input, select").forEach((input) => {
      input.disabled = index !== next;
    });
  });
  back.disabled = false;
  planner.hidden = false;
  sections[next].querySelector("h1").focus();
}

function showOutcome(title, message, plan) {
  resetDodge();
  welcome.hidden = true;
  planner.hidden = true;
  get("outcome-title").textContent = title;
  get("outcome-message").textContent = message;
  get("outcome-plan").textContent = plan || "";
  get("outcome-plan").hidden = !plan;
  get("outcome").hidden = false;
  get("outcome-title").focus();
}

function placeNo(x, y) {
  no.style.setProperty("--x", x + "px");
  no.style.setProperty("--y", y + "px");
}

function animateDodge(now) {
  const rect = no.getBoundingClientRect();
  const dx = dodgeTarget.x - rect.left;
  const dy = dodgeTarget.y - rect.top;
  const distance = Math.hypot(dx, dy);
  if (distance < 1) {
    placeNo(dodgeTarget.x, dodgeTarget.y);
    dodgeFrame = 0;
    lastFrame = undefined;
    return;
  }
  const elapsed = Math.min(now - (lastFrame ?? now - 16), 32);
  const fraction = Math.min(1, elapsed * 0.8 / distance, elapsed / 55);
  placeNo(rect.left + dx * fraction, rect.top + dy * fraction);
  lastFrame = now;
  dodgeFrame = requestAnimationFrame(animateDodge);
}

function dodge({ clientX, clientY }) {
  const rect = no.getBoundingClientRect();
  const gapX = Math.max(rect.left - clientX, clientX - rect.right, 0);
  const gapY = Math.max(rect.top - clientY, clientY - rect.bottom, 0);
  if (Math.hypot(gapX, gapY) > 70) return;

  const inset = 12;
  const maxX = Math.max(inset, document.documentElement.clientWidth - rect.width - inset);
  const maxY = Math.max(inset, document.documentElement.clientHeight - rect.height - inset);
  const away = Math.atan2(rect.top + rect.height / 2 - clientY, rect.left + rect.width / 2 - clientX);
  let bestDistance = -1;
  for (let direction = 0; direction < 8; direction++) {
    const angle = away + direction * Math.PI / 4;
    const x = Math.min(maxX, Math.max(inset, rect.left + Math.cos(angle) * 145));
    const y = Math.min(maxY, Math.max(inset, rect.top + Math.sin(angle) * 145));
    const distance = Math.hypot(x + rect.width / 2 - clientX, y + rect.height / 2 - clientY);
    if (distance > bestDistance) {
      bestDistance = distance;
      dodgeTarget = { x, y };
    }
  }
  if (!dodgeFrame) {
    placeNo(rect.left, rect.top);
    no.classList.add("moving");
    dodgeFrame = requestAnimationFrame(animateDodge);
  }
}

document.addEventListener("pointermove", (event) => {
  if (!welcome.hidden && event.pointerType === "mouse") dodge(event);
});
no.addEventListener("click", (event) => {
  if (event.detail && event.pointerType !== "touch") {
    dodge(event);
    return;
  }
  showOutcome("Maybe another time ♡", "Thanks for reading my little note.");
});
window.addEventListener("resize", resetDodge);

get("yes").addEventListener("click", () => {
  resetDodge();
  welcome.hidden = true;
  showStep(0);
});

back.addEventListener("click", () => {
  if (step > 0) {
    showStep(step - 1);
    return;
  }
  planner.hidden = true;
  welcome.hidden = false;
  get("yes").focus();
});

function buildFilmCards() {
  const choices = document.createElement("fieldset");
  choices.className = "film-choices";
  const legend = document.createElement("legend");
  legend.append("Choose a film from ");
  const source = document.createElement("a");
  source.href = "https://cinemastercard.az/en/";
  source.target = "_blank";
  source.rel = "noopener noreferrer";
  source.textContent = "CineMastercard";
  legend.append(source);
  const grid = document.createElement("div");
  grid.className = "film-grid";
  for (const movie of movies) {
    const card = document.createElement("label");
    card.className = "film-card";
    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "film";
    radio.value = movie.title;
    const poster = document.createElement("div");
    poster.className = "film-poster";
    const image = document.createElement("img");
    image.alt = "";
    image.loading = "lazy";
    image.referrerPolicy = "no-referrer";
    image.addEventListener("error", () => image.remove());
    image.src = movie.poster;
    poster.append(image);
    const title = document.createElement("span");
    title.textContent = movie.title;
    card.append(radio, poster, title);
    grid.append(card);
  }
  choices.append(legend, grid);
  return choices;
}

function buildOptionCards({ detail, cards }) {
  const choices = document.createElement("fieldset");
  choices.className = "cuisine-choices";
  if (activity === "coffee") choices.classList.add("coffee-choices");
  const legend = document.createElement("legend");
  legend.className = "sr-only";
  legend.textContent = detail;
  const grid = document.createElement("div");
  grid.className = "cuisine-grid";
  for (const [name, icon, location] of cards) {
    const card = document.createElement("label");
    card.className = "cuisine-card";
    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = activity;
    radio.value = location ? name + " · " + location : name;
    radio.required = activity === "food";
    const illustration = document.createElement("span");
    illustration.className = "cuisine-icon";
    illustration.setAttribute("aria-hidden", "true");
    illustration.textContent = icon;
    const title = document.createElement("span");
    title.textContent = name;
    card.append(radio, illustration, title);
    if (location) {
      const address = document.createElement("small");
      address.textContent = location;
      title.append(address);
    }
    grid.append(card);
  }
  choices.append(legend, grid);
  return choices;
}

function addCoffeeSearch(choices) {
  const label = document.createElement("label");
  label.htmlFor = "coffee-search";
  label.textContent = "Search coffee shops";
  const search = document.createElement("input");
  search.id = "coffee-search";
  search.type = "search";
  search.placeholder = "Search by name or location";
  const grid = choices.querySelector(".cuisine-grid");
  const empty = document.createElement("p");
  empty.className = "coffee-empty";
  empty.setAttribute("role", "status");
  empty.textContent = "No matches. You can enter a coffee shop below.";
  empty.hidden = true;
  choices.querySelector("legend").after(label, search);
  grid.after(empty);

  const normalize = (text) => text.toLowerCase().normalize("NFD")
    .replace(/\p{M}/gu, "").replace(/ə/g, "e").replace(/ı/g, "i");
  search.addEventListener("input", () => {
    const words = normalize(search.value).trim().split(/\s+/);
    let hasMatches = false;
    for (const card of grid.children) {
      const coffeeShop = normalize(card.querySelector("input").value);
      card.hidden = !words.every((word) => coffeeShop.includes(word));
      hasMatches ||= !card.hidden;
    }
    grid.hidden = !hasMatches;
    empty.hidden = hasMatches;
    grid.scrollTop = 0;
  });
}

sections[0].querySelectorAll("button[data-activity]").forEach((button) => {
  button.addEventListener("click", () => {
    if (activity === button.dataset.activity) {
      showStep(1);
      return;
    }
    activity = button.dataset.activity;
    const option = activities[activity];
    get("detail-heading").innerHTML = option.heading;
    const field = get("detail-field");
    choiceGroup = option.cards ? buildOptionCards(option) : buildFilmCards();
    field.replaceChildren(choiceGroup);
    if (activity === "food") {
      detailInput = undefined;
      showStep(1);
      return;
    }

    const coffee = activity === "coffee";
    if (coffee) addCoffeeSearch(choiceGroup);
    const label = document.createElement("label");
    label.htmlFor = "choice";
    label.textContent = coffee ? "Or enter another coffee shop" : "Or enter another film";
    detailInput = document.createElement("input");
    detailInput.id = "choice";
    field.append(label, detailInput);
    detailInput.maxLength = 160;
    detailInput.placeholder = coffee ? "Coffee shop name" : "The movie you want to see";
    detailInput.addEventListener("input", () => {
      detailInput.setCustomValidity("");
      const selected = choiceGroup.querySelector(":checked");
      if (detailInput.value.trim() && selected) selected.checked = false;
    });
    choiceGroup.addEventListener("change", (event) => {
      if (event.target.type !== "radio") return;
      detailInput.setCustomValidity("");
      detailInput.value = "";
    });
    showStep(1);
  });
});

planner.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (send.disabled || step === 0) return;
  const detail = choiceGroup?.querySelector(":checked")?.value ?? detailInput?.value.trim();
  if (step === 1) {
    if (!detail) {
      detailInput?.setCustomValidity(activity === "coffee"
        ? "Choose a coffee shop or enter its name."
        : "Choose a film or enter a title.");
      detailInput?.reportValidity();
      return;
    }
    calendar.refresh();
    get("plan").textContent = activities[activity].label + " · " + detail;
    status.textContent = "";
    showStep(2);
    return;
  }

  const chosenDate = calendar.value;
  if (!chosenDate) {
    status.textContent = "Choose a day on the calendar.";
    calendar.focus();
    return;
  }
  const selection = { activity, detail, date: chosenDate };
  if (!pendingReply || Object.keys(selection).some((key) => pendingReply[key] !== selection[key])) {
    pendingReply = { id: crypto.randomUUID(), ...selection };
  }
  send.disabled = back.disabled = calendar.element.disabled = true;
  status.textContent = "Saving your reply…";
  try {
    await submitReply(pendingReply);
    showOutcome(
      "It’s a date! ♡",
      "I can’t wait to see you.",
      activities[activity].label + " · " + detail + " · " + formatDate(selection.date),
    );
  } catch {
    status.textContent = "Your reply couldn’t be saved. Please try again.";
  } finally {
    send.disabled = back.disabled = calendar.element.disabled = false;
  }
});
