document.addEventListener('DOMContentLoaded', () => {
    const zones = {
        "PST / PDT (Los Angeles)": "America/Los_Angeles",
        "EST / EDT (New York)": "America/New_York",
        "IST (Chennai)": "Asia/Kolkata",
        "UTC (Coordinated Universal Time)": "UTC",
        "GMT (London)": "Europe/London",
    };
    const fromSelect = document.getElementById("fromZone");
    const toSelect = document.getElementById("toZone");
    const dateTimeInput = document.getElementById("dateTimeInput");
    const convertedTime = document.getElementById("convertedTime");
    const convertedDate = document.getElementById("convertedDate");
    const toZoneDisplay = document.getElementById("toZoneDisplay");
    const currentTimesDiv = document.getElementById("currentTimes");
    const themeToggle = document.getElementById("themeToggle");
    const body = document.body;
    // --- Theme Logic ---
    function enableDarkMode() {
        body.classList.add('dark-mode');
        body.classList.remove('light-mode');
        localStorage.setItem('theme', 'dark');
    }
    function enableLightMode() {
        body.classList.add('light-mode');
        body.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light');
    }
    if (localStorage.getItem('theme') === 'light') enableLightMode();
    themeToggle.addEventListener('click', () => {
        if (body.classList.contains('dark-mode')) enableLightMode();
        else enableDarkMode();
    });
    // --- Populate Zones ---
    Object.keys(zones).forEach(name => {
        fromSelect.add(new Option(name, zones[name]));
        toSelect.add(new Option(name, zones[name]));
    });
    // --- Defaults ---
    fromSelect.value = zones["PST / PDT (Los Angeles)"];
    toSelect.value = zones["IST (Chennai)"];
    // Set default input time to NOW in the 'From' zone
    function setInitialTime() {
        const now = new Date();
        const f = (o) => new Intl.DateTimeFormat('en', { ...o, timeZone: fromSelect.value }).format(now);
        dateTimeInput.value = `${f({year:'numeric'})}-${f({month:'2-digit'})}-${f({day:'2-digit'})}T${f({hour:'2-digit', hourCycle:'h23'})}:${f({minute:'2-digit'})}`;
    }
    setInitialTime();
    // --- Conversion Engine ---
    function convertTime() {
        const dateTimeValue = dateTimeInput.value;
        const fromZone = fromSelect.value;
        const toZone = toSelect.value;
        toZoneDisplay.textContent = toSelect.options[toSelect.selectedIndex].text.split('(')[0].trim();
        if (!dateTimeValue) return;
        // Parse input parts
        const [datePart, timePart] = dateTimeValue.split('T');
        const [year, month, day] = datePart.split('-');
        const [hours, minutes] = timePart.split(':');
        // Create date in local system time first
        const date = new Date(year, month - 1, day, hours, minutes);
        // Calculate the difference between UTC and the 'From' timezone
        const utcStr = date.toLocaleString('en-US', { timeZone: 'UTC' });
        const fromStr = date.toLocaleString('en-US', { timeZone: fromZone });
        const utcDate = new Date(utcStr);
        const fromTzDate = new Date(fromStr);
        const offset = utcDate.getTime() - fromTzDate.getTime();
        const actualUtcTime = date.getTime() + offset;
        const finalMoment = new Date(actualUtcTime);
        // Format for 'To' Zone
        const timeFmt = new Intl.DateTimeFormat('en-US', { timeZone: toZone, hour: '2-digit', minute: '2-digit', hour12: true });
        const dateFmt = new Intl.DateTimeFormat('en-US', { timeZone: toZone, year: 'numeric', month: 'short', day: '2-digit', weekday: 'short' });
        convertedTime.textContent = timeFmt.format(finalMoment);
        convertedDate.textContent = dateFmt.format(finalMoment);
    }
    // --- Tickers ---
    function updateTickers() {
        const tickerZones = { "PST": zones["PST / PDT (Los Angeles)"], "IST": zones["IST (Chennai)"], "UTC": "UTC" };
        currentTimesDiv.innerHTML = '';
        const now = new Date();
        Object.keys(tickerZones).forEach(key => {
            const time = new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: tickerZones[key], hour12: false }).format(now);
            currentTimesDiv.innerHTML += `<div class="current-time-item"><span>${key}</span><span class="current-time-value">${time}</span></div>`;
        });
    }
    [fromSelect, toSelect, dateTimeInput].forEach(el => el.addEventListener("change", convertTime));
    convertTime();
    updateTickers();
    setInterval(updateTickers, 1000);
});
