const zones = {
  "PACIFIC TIME (US)": "America/Los_Angeles",
  "IST": "Asia/Kolkata",
  "UTC": "UTC",
  "GMT": "Europe/London"
};
const fromSelect = document.getElementById("fromZone");
const toSelect = document.getElementById("toZone");
const result = document.getElementById("result");
Object.keys(zones).forEach(zone => {
  fromSelect.add(new Option(zone, zones[zone]));
  toSelect.add(new Option(zone, zones[zone]));
});
fromSelect.selectedIndex = 0;
toSelect.selectedIndex = 1;
function convertTime() {
  const date = document.getElementById("date").value;
  const time = document.getElementById("time").value;
  if (!date || !time) return;
  const fromZone = fromSelect.value;
  const toZone = toSelect.value;
  // Create a UTC-based timestamp from the input components
  const [year, month, day] = date.split("-");
  const [hour, minute] = time.split(":");
  // Step 1: Treat input as time in FROM timezone
  const fromDate = new Date(
    new Date(Date.UTC(year, month - 1, day, hour, minute))
      .toLocaleString("en-US", { timeZone: fromZone })
  );
  // Step 2: Convert to TO timezone
  const output = new Intl.DateTimeFormat("en-GB", {
    timeZone: toZone,
    dateStyle: "medium",
    timeStyle: "short"
  }).format(fromDate);
  result.textContent = output;
}
document.querySelectorAll("input, select").forEach(el =>
  el.addEventListener("change", convertTime)
);
// Force picker to open on click (most browsers)
document.getElementById("date").addEventListener("click", function () {
  this.showPicker && this.showPicker();
});
document.getElementById("time").addEventListener("click", function () {
  this.showPicker && this.showPicker();
});
