const zones = {
  "Pacific Time (PST/PDT)": "America/Los_Angeles",
  "IST (India)": "Asia/Kolkata",
  "UTC (No DST)": "UTC",
  "UK Time (GMT/BST)": "Europe/London"
};
const fromSelect = document.getElementById("fromZone");
const toSelect = document.getElementById("toZone");
const result = document.getElementById("result");
Object.entries(zones).forEach(([label, value]) => {
  fromSelect.add(new Option(label, value));
  toSelect.add(new Option(label, value));
});
fromSelect.selectedIndex = 0;
toSelect.selectedIndex = 1;
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
  const base = new Date(
    new Date(Date.UTC(y, m - 1, d, h, min))
      .toLocaleString("en-US", { timeZone: fromZone })
  );
  result.textContent = new Intl.DateTimeFormat("en-GB", {
    timeZone: toZone,
    dateStyle: "medium",
    timeStyle: "short"
  }).format(base);
}
document.querySelectorAll("input, select")
  .forEach(el => el.addEventListener("change", convertTime));
document.getElementById("swapBtn").onclick = () => {
  [fromSelect.selectedIndex, toSelect.selectedIndex] =
  [toSelect.selectedIndex, fromSelect.selectedIndex];
  convertTime();
};
document.getElementById("copyBtn").onclick = () => {
  navigator.clipboard.writeText(result.textContent);
};
document.getElementById("darkToggle").onclick = () => {
  document.body.classList.toggle("dark");
};
