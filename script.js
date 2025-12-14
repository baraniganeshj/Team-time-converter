document.addEventListener('DOMContentLoaded', () => {
    const zones = {
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
    const themeToggle = document.getElementById("themeToggle");
    const body = document.body;
    // --- Theme Switcher Logic (New Feature) ---
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
    function initializeTheme() {
        // 1. Check user's stored preference
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme === 'dark') {
            enableDarkMode();
        } else if (storedTheme === 'light') {
            enableLightMode();
        }
        // 2. If no stored preference, check OS preference (high-level engineering detail)
        else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            enableDarkMode();
        } else {
            // Default to dark mode (as requested by previous output)
            enableDarkMode();
        }
    }
    themeToggle.addEventListener('click', () => {
        if (body.classList.contains('dark-mode')) {
            enableLightMode();
        } else {
            enableDarkMode();
        }
    });
    // --- 1. Populate Selects ---
    Object.keys(zones).forEach(zoneName => {
        const timeZoneValue = zones[zoneName];
        fromSelect.add(new Option(zoneName, timeZoneValue));
        toSelect.add(new Option(zoneName, timeZoneValue));
    });
    // --- 2. Set Initial Values & Defaults ---
    fromSelect.value = zones["PST / PDT (Los Angeles)"];
    toSelect.value = zones["IST (Kolkata)"];
    // Set default date/time to now in the 'From' zone
    const now = new Date();
    const initialFromZone = fromSelect.value;
    // Helper function to format date for input[type="datetime-local"]
    function formatToLocalInput(date, timeZone) {
        // This is a complex step, better to use multiple Intl calls to get the exact parts
        const year = new Intl.DateTimeFormat('en', { year: 'numeric', timeZone: timeZone }).format(date);
        const month = new Intl.DateTimeFormat('en', { month: '2-digit', timeZone: timeZone }).format(date);
        const day = new Intl.DateTimeFormat('en', { day: '2-digit', timeZone: timeZone }).format(date);
        const hour = new Intl.DateTimeFormat('en', { hour: '2-digit', hourCycle: 'h23', timeZone: timeZone }).format(date);
        const minute = new Intl.DateTimeFormat('en', { minute: '2-digit', timeZone: timeZone }).format(date);
        return `${year}-${month}-${day}T${hour}:${minute}`;
    }
    dateTimeInput.value = formatToLocalInput(now, initialFromZone);
    // --- 3. Core Conversion Logic ---
    function convertTime() {
        const dateTimeLocal = dateTimeInput.value;
        const fromZone = fromSelect.value;
        const toZone = toSelect.value;
        const selectedToOption = toSelect.options[toSelect.selectedIndex].text;
        toZoneDisplay.textContent = selectedToOption.replace(/\s*\(.*\)/, '');
        if (!dateTimeLocal) {
            convertedTime.textContent = "--:--";
            convertedDate.textContent = "Please select a date and time.";
            return;
        }
        // Parse the input date string and anchor it to the FROM zone
        const parts = dateTimeLocal.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
        if (!parts) return;
        const [_, year, month, day, hour, minute] = parts.map(Number);
        const fromDateString = `${month}/${day}/${year} ${hour}:${minute}:00`;
        // Create the absolute moment in time (UTC epoch)
        // This trick is the best compromise for reliable cross-browser/timezone parsing.
        const fromDate = new Date(
            new Date(fromDateString).toLocaleString("en-US", { timeZone: fromZone })
        );
        // Convert the absolute moment (fromDate) to the target zone formats
        const timeFormatter = new Intl.DateTimeFormat('en-US', {
            timeZone: toZone,
            hour: '2-digit', minute: '2-digit', hour12: true
        });
        const dateFormatter = new Intl.DateTimeFormat('en-US', {
            timeZone: toZone,
            year: 'numeric', month: 'short', day: '2-digit', weekday: 'short'
        });
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
                timeZone: timeZone, hour12: false
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
    // --- 5. Event Listeners and Initialization ---
    document.querySelectorAll(".input-field, .to-zone-select").forEach(el =>
        el.addEventListener("change", convertTime)
    );
    // Initialize
    initializeTheme();
    convertTime();
    updateCurrentTimes();
    setInterval(updateCurrentTimes, 1000);
});
