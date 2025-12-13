const zones = {
  "PACIFIC TIME (US)": "America/Los_Angeles",
  "IST": "Asia/Kolkata",
  "UTC": "UTC",
  "GMT": "Europe/London"
};
const fromSelect = document.getElementById("fromZone");
const toSelect = document.getElementById("toZone");
const result = document.getElementById("result");
// Populate dropdowns
Object.keys(zones).forEach(zone => {
  fromSelect.add(new Option(zone, zones[zone]));
  toSelect.add(new Option(zone, zones[zone]));
});
// Default selection
fromSelect.selectedIndex = 0; // Pacific Time
toSelect.selectedIndex = 1;   // IST
function convertTime() {
  const date = document.getElementById("date").value;
  const time = document.getElementById("time").value;
  if (!date || !time) return;
  const toZone = toSelect.value;
  // Create date from input
  const inputDate = new Date(`${date}T${time}:00`);
  // Convert & format
  const output = new Intl.DateTimeFormat("en-GB", {
    timeZone: toZone,
    dateStyle: "medium",
    timeStyle: "short"
  }).format(inputDate);
  result.textContent = output;
}
// Auto convert on change
document.querySelectorAll("input, select").forEach(el =>
  el.addEventListener("change", convertTime)
);
