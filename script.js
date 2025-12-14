document.addEventListener('DOMContentLoaded', () => {
    const zones = {
        // Updated set with more professional zone names and current timezones
        "PST / PDT (Los Angeles)": "America/Los_Angeles",
        "EST / EDT (New York)": "America/New_York",
        "IST (Kolkata)": "Asia/Kolkata",
        "CET / CEST (Berlin)": "Europe/Berlin",
        "GMT / BST (London)": "Europe/London",
        "JST (Tokyo)": "Asia/Tokyo",
        "UTC (Coordinated Universal Time)": "UTC",
    };
    const fromSelect = document.getElementById("fromZone");
    const toSelect = document.getElementById("toZone");
    const dateTimeInput = document.getElementById("dateTimeInput");
    const convertedTime = document.getElementById("convertedTime");
    const convertedDate = document.getElementById("convertedDate");
    const toZoneDisplay = document.getElementById("toZoneDisplay");
    const currentTimesDiv = document.getElementById("currentTimes");
    // --- 1. Populate Selects ---
    Object.keys(zones).forEach(zoneName => {
        const timeZoneValue = zones[zoneName];
        fromSelect.add(new Option(zoneName, timeZoneValue));
        toSelect.add(new Option(zoneName, timeZoneValue));
    });
    // --- 2. Set Initial Values & Defaults ---
    // Set 'From' to PST/PDT and 'To' to IST as a likely scenario
    fromSelect.value = zones["PST / PDT (Los Angeles)"];
    toSelect.value = zones["IST (Kolkata)"];
    // Set default date/time to now in the 'From' zone
    const now = new Date();
    // Set a date close to the current time, but rounded for better input experience
    const initialFromZone = fromSelect.value;
    const formattedDate = new Intl.DateTimeFormat('en-US', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
        timeZone: initialFromZone
    }).format(now);
    // JS date input requires YYYY-MM-DDTHH:MM format
    const [month, day, year, time] = formattedDate.match(/(\d{2})\/(\d{2})\/(\d{4}),\s*(\d{2}:\d{2})/i).slice(1);
    dateTimeInput.value = `${year}-${month}-${day}T${time}`;
    // --- 3. Core Conversion Logic ---
    function convertTime() {
        const dateTimeLocal = dateTimeInput.value;
        const fromZone = fromSelect.value;
        const toZone = toSelect.value;
        // Update the visible zone name
        const selectedToOption = toSelect.options[toSelect.selectedIndex].text;
        toZoneDisplay.textContent = selectedToOption.replace(/\s*\(.*\)/, ''); // Clean up name
        if (!dateTimeLocal) {
            convertedTime.textContent = "--:--";
            convertedDate.textContent = "Please select a date and time.";
            return;
        }
        // Get the local date string (e.g., "2025-12-14T16:00")
        // and the time zone (e.g., "America/Los_Angeles")
        // This is the key change: create a time string that is interpreted as being in the FROM zone.
        // The format needed for a Date object to properly parse a timezone-aware string is:
        // "YYYY-MM-DDTHH:MM:SSZ" or "MM/DD/YYYY HH:MM:SS" with no zone or "TZ identifier"
        // The most reliable way is to take the date/time string, append the zone, and then
        // use the Date object to parse it into an absolute moment in time (UTC epoch).
        // A simpler, modern approach leveraging Intl is to use the components and let it handle the conversion
        // Create a basic Date object from the input string (It is interpreted as the browser's local time first)
        const localInputDate = new Date(dateTimeLocal);
        // However, we want it to be *interpreted* as the `fromZone`. We cannot reliably do this
        // with the basic Date object. We must construct a UTC time that, when viewed from the
        // 'fromZone', matches the input time.
        // Simpler implementation: Assume the input time is in *UTC* for a moment, then convert
        // it to the *FROM* zone, calculate the actual UTC offset, and correct the Date object.
        // A much more robust way is to just use Intl.
        // Get the milliseconds since epoch for the given datetime in the *fromZone*
        const parts = dateTimeLocal.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
        const [_, year, month, day, hour, minute] = parts.map(Number);
        // Construct a string that Date() will interpret as being in the `fromZone`
        const fromDateString = `${month}/${day}/${year} ${hour}:${minute}:00`;
        // The input date is NOW a fixed point in time, anchored to the FROM zone
        const fromDate = new Date(
            new Date(fromDateString).toLocaleString("en-US", { timeZone: fromZone })
        );
        // This Date object now represents the correct moment in UTC, based on the input date/time in the FROM zone.
        // Convert the absolute moment (fromDate) to the target zone
        const options = {
            timeZone: toZone,
            hour: '2-digit', minute: '2-digit',
            year: 'numeric', month: 'short', day: '2-digit',
            weekday: 'short',
            hour12: true // Professional sites often use 12-hour clock with AM/PM
        };
        const timeFormatter = new Intl.DateTimeFormat('en-US', { timeZone: toZone, hour: '2-digit', minute: '2-digit', hour12: true });
        const dateFormatter = new Intl.DateTimeFormat('en-US', { timeZone: toZone, year: 'numeric', month: 'short', day: '2-digit', weekday: 'short' });
        convertedTime.textContent = timeFormatter.format(fromDate);
        convertedDate.textContent = dateFormatter.format(fromDate);
    }
    // --- 4. Current Time Display (Live Tickers) ---
    function updateCurrentTimes() {
        const zonesToShow = {
            "PST": zones["PST / PDT (Los Angeles)"],
            "IST": zones["IST (Kolkata)"],
            "UTC": zones["UTC (Coordinated Universal Time)"]
        };
        currentTimesDiv.innerHTML = '';
        const now = new Date();
        Object.keys(zonesToShow).forEach(key => {
            const timeZone = zonesToShow[key];
            const time = new Intl.DateTimeFormat('en-US', {
                hour: '2-digit', minute: '2-digit', second: '2-digit',
                timeZone: timeZone, hour12: false // 24hr for tickers is cleaner
            }).format(now);
            const item = document.createElement('div');
            item.className = 'current-time-item';
            item.innerHTML = `
                <span>${key}</span>
                <span class="current-time-value">${time}</span>
            `;
            currentTimesDiv.appendChild(item);
        });
    }
    // --- 5. Event Listeners ---
    document.querySelectorAll(".input-field, .to-zone-select").forEach(el =>
        el.addEventListener("change", convertTime)
    );
    // Run initial conversion and set up live tickers
    convertTime();
    updateCurrentTimes();
    setInterval(updateCurrentTimes, 1000);
});







