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
fromSelect.selectedIndex = 0;
toSelect.selectedIndex = 1;
function convertTime() {
  const date = document.getElementById("date").value;
  const time = document.getElementById("time").value;
  if (!date || !time) return;
  const fromZone = fromSelect.value;
  const toZone = toSelect.value;
  const [year, month, day] = date.split("-");
  const [hour, minute] = time.split(":");
  // Treat input as FROM timezone, not local machine timezone
  const fromDate = new Date(
    new Date(Date.UTC(year, month - 1, day, hour, minute))
      .toLocaleString("en-US", { timeZone: fromZone })
  );
  const output = new Intl.DateTimeFormat("en-GB", {
    timeZone: toZone,
    dateStyle: "medium",
    timeStyle: "short"
  }).format(fromDate);
  result.textContent = output;
}
// Auto convert
document.querySelectorAll("input, select")
  .forEach(el => el.addEventListener("change", convertTime));
