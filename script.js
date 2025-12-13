const zones = {
  "Pacific Time (PST/PDT)": "America/Los_Angeles",
  "IST (India)": "Asia/Kolkata",
  "UTC": "UTC",
  "UK Time": "Europe/London"
};
const fromSelect = document.getElementById("fromZone");
const toSelect = document.getElementById("toZone");
const result = document.getElementById("result");
const themeToggle = document.getElementById("themeToggle");
// Populate dropdowns
Object.entries(zones).forEach(([label, value]) => {
  fromSelect.add(new Option(label, value));
  toSelect.add(new Option(label, value));
});
fromSelect.selectedIndex = 0;
toSelect.selectedIndex = 1;
// Time conversion (timezone-safe)
function convertTime() {
  const date = document.getElementById("date").value;
  const time = document.getElementById("time").value;
  if (!date || !time) {
    result.textContent = "Please select date and time";
    return;
  }
  const fromZone = fromSelect.value;
  const toZone = toSelect.value;
  const [y, m, d] = date.split("-");
  const [h, min] = time.split(":");
  const baseDate = new Date(
    new Date(Date.UTC(y, m - 1, d, h, min))
      .toLocaleString("en-US", { timeZone: fromZone })
  );
  const output = new Intl.DateTimeFormat("en-GB", {
    timeZone: toZone,
    dateStyle: "medium",
    timeStyle: "short"
  }).format(baseDate);
  result.textContent = output;
}
// Auto convert
document.querySelectorAll("input, select")
  .forEach(el => el.addEventListener("change", convertTime));
// Swap zones
document.getElementById("swapBtn").onclick = () => {
  const temp = fromSelect.selectedIndex;
  fromSelect.selectedIndex = toSelect.selectedIndex;
  toSelect.selectedIndex = temp;
  convertTime();
};
// Copy result
document.getElementById("copyBtn").onclick = () => {
  const text = result.textContent;
  if (!text || text.includes("select")) return;
  navigator.clipboard
    ? navigator.clipboard.writeText(text)
    : alert("Clipboard not supported");
};
// Dark mode toggle
themeToggle.onclick = () => {
  document.body.classList.toggle("dark");
  themeToggle.textContent =
    document.body.classList.contains("dark") ? ":sunny:" : ":crescent_moon:";
};




