import { formatDate, todayInBaku } from "./options.js";

const element = document.getElementById("calendar");
const grid = document.getElementById("calendar-days");
const heading = document.getElementById("calendar-month");
const previous = document.getElementById("previous-month");
const next = document.getElementById("next-month");
const summary = document.getElementById("calendar-selection");
const monthFormat = new Intl.DateTimeFormat("en", {
  month: "long", year: "numeric", timeZone: "UTC",
});
const offsets = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };

let today;
let selected;
let active;
let month;

function iso(date) {
  return date.toISOString().slice(0, 10);
}

function firstOfMonth(value) {
  return new Date(value.slice(0, 7) + "-01T00:00:00Z");
}

function render() {
  const title = monthFormat.format(month);
  if (heading.textContent !== title) heading.textContent = title;
  previous.disabled = iso(month).slice(0, 7) <= today.slice(0, 7);

  const leadingDays = (month.getUTCDay() + 6) % 7;
  const end = new Date(month);
  end.setUTCMonth(end.getUTCMonth() + 1, 0);
  const cells = Array.from({ length: leadingDays }, () => document.createElement("span"));
  for (let day = 1; day <= end.getUTCDate(); day++) {
    const date = new Date(month);
    date.setUTCDate(day);
    const value = iso(date);
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = day;
    button.dataset.date = value;
    button.disabled = value < today;
    button.tabIndex = value === active ? 0 : -1;
    button.setAttribute("aria-label", formatDate(value));
    button.setAttribute("aria-pressed", String(value === selected));
    if (value === today) button.setAttribute("aria-current", "date");
    cells.push(button);
  }
  grid.replaceChildren(...cells);
  summary.textContent = selected ? formatDate(selected) : "Choose a day";
}

function focusDay() {
  grid.querySelector('[tabindex="0"]')?.focus();
}

function navigateMonth(offset) {
  month.setUTCMonth(month.getUTCMonth() + offset);
  active = iso(month) < today ? today : iso(month);
  render();
  if (document.activeElement === document.body && previous.disabled) focusDay();
}

previous.addEventListener("click", () => navigateMonth(-1));
next.addEventListener("click", () => navigateMonth(1));

grid.addEventListener("click", (event) => {
  const value = event.target.dataset.date;
  if (!value) return;
  active = selected = value;
  render();
  focusDay();
  document.getElementById("submit-status").textContent = "";
});

grid.addEventListener("keydown", (event) => {
  const offset = offsets[event.key];
  if (!offset || !event.target.dataset.date) return;
  event.preventDefault();
  const target = new Date(event.target.dataset.date + "T00:00:00Z");
  target.setUTCDate(target.getUTCDate() + offset);
  active = iso(target) < today ? today : iso(target);
  month = firstOfMonth(active);
  render();
  focusDay();
});

export const calendar = {
  element,
  refresh() {
    today = todayInBaku();
    if (selected < today) selected = undefined;
    active = selected || today;
    month = firstOfMonth(active);
    render();
  },
  get value() {
    if (selected && selected >= todayInBaku()) return selected;
    if (selected) this.refresh();
    return undefined;
  },
  focus: focusDay,
};
