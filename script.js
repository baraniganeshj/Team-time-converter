document.addEventListener('DOMContentLoaded', () => {
    // Standard Global Zones
    const globalZones = {
        "PST / PDT (Los Angeles)": "America/Los_Angeles",
        "EST / EDT (New York)": "America/New_York",
        "IST (Chennai)": "Asia/Kolkata",
        "UTC (Coordinated Universal Time)": "UTC",
        "GMT (London)": "Europe/London",
    };
    // Detailed US Zones for the new feature
    const usZones = {
        "Eastern Time (ET) - New York": "America/New_York",
        "Central Time (CT) - Chicago": "America/Chicago",
        "Mountain Time (MT) - Denver": "America/Denver",
        "Pacific Time (PT) - Los Angeles": "America/Los_Angeles",
        "Alaska Time (AKT) - Anchorage": "America/Anchorage",
        "Hawaii Time (HT) - Honolulu": "Pacific/Honolulu",
    };
    // Global Converter Elements
    const fromSelect = document.getElementById("fromZone");
    const toSelect = document.getElementById("toZone");
    const dateTimeInput = document.getElementById("dateTimeInput");
    const convertedTime = document.getElementById("convertedTime");
    const convertedDate = document.getElementById("convertedDate");
    const toZoneDisplay = document.getElementById("toZoneDisplay");
    const currentTimesDiv = document.getElementById("currentTimes");
    const themeToggle = document.getElementById("themeToggle");
    const body = document.body;
    // US Converter Elements
    const usFromSelect = document.getElementById("usFromZone");
    const usToSelect = document.getElementById("usToZone");
    const usConvertedTime = document.getElementById("usConvertedTime");
    const usConvertedDate = document.getElementById("usConvertedDate");
    // --- Theme Switcher Logic (UNCHANGED) ---
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
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme === 'dark') {
            enableDarkMode();
        } else if (storedTheme === 'light') {
            enableLightMode();
        }
        else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            enableDarkMode();
        } else {
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
    Object.keys(globalZones).forEach(zoneName => {
        const timeZoneValue = globalZones[zoneName];
        fromSelect.add(new Option(zoneName, timeZoneValue));
        toSelect.add(new Option(zoneName, timeZoneValue));
    });
    // Populate US Selects
    Object.keys(usZones).forEach(zoneName => {
        const timeZoneValue = usZones[zoneName];
        usFromSelect.add(new Option(zoneName, timeZoneValue));
        usToSelect.add(new Option(zoneName, timeZoneValue));
    });
    // Set US converter defaults
    usFromSelect.value = usZones["Eastern Time (ET) - New York"];
    usToSelect.value = usZones["Pacific Time (PT) - Los Angeles"];
    // --- 2. Set Global Initial Values & Defaults ---
    fromSelect.value = globalZones["PST / PDT (Los Angeles)"];
    toSelect.value = globalZones["IST (Chennai)"];
    const now = new Date();
    const initialFromZone = fromSelect.value;
    function formatToLocalInput(date, timeZone) {
        const year = new Intl.DateTimeFormat('en', { year: 'numeric', timeZone: timeZone }).format(date);
        const month = new Intl.DateTimeFormat('en', { month: '2-digit', timeZone: timeZone }).format(date);
        const day = new Intl.DateTimeFormat('en', { day: '2-digit', timeZone: timeZone }).format(date);
        const hour = new Intl.DateTimeFormat('en', { hour: '2-digit', hourCycle: 'h23', timeZone: timeZone }).format(date);
        const minute = new Intl.DateTimeFormat('en', { minute: '2-digit', timeZone: timeZone }).format(date);
        return `${year}-${month}-${day}T${hour}:${minute}`;
    }
    dateTimeInput.value = formatToLocalInput(now, initialFromZone);
    // --- 3. Core Conversion Logic (Reusable) ---
    function performConversion(dateTimeLocal, fromZone, toZone, timeOutputEl, dateOutputEl) {
        if (!dateTimeLocal) return;
        const parts = dateTimeLocal.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
        if (!parts) return;
        const [_, year, month, day, hour, minute] = parts.map(Number);
        const fromDateString = `${month}/${day}/${year} ${hour}:${minute}:00`;
        const fromDate = new Date(
            new Date(fromDateString).toLocaleString("en-US", { timeZone: fromZone })
        );
        const timeFormatter = new Intl.DateTimeFormat('en-US', {
            timeZone: toZone,
            hour: '2-digit', minute: '2-digit', hour12: true
        });
        const dateFormatter = new Intl.DateTimeFormat('en-US', {
            timeZone: toZone,
            year: 'numeric', month: 'short', day: '2-digit', weekday: 'short'
        });
        timeOutputEl.textContent = timeFormatter.format(fromDate);
        dateOutputEl.textContent = dateFormatter.format(fromDate);
    }
    // Global Converter Function
    function convertTime() {
        // Update the visual zone name
        const selectedToOption = toSelect.options[toSelect.selectedIndex].text;
        toZoneDisplay.textContent = selectedToOption.replace(/\s*\(.*\)/, '');
        performConversion(
            dateTimeInput.value,
            fromSelect.value,
            toSelect.value,
            convertedTime,
            convertedDate
        );
    }
    // US Converter Function (Uses Global Input Time)
    function convertUSTime() {
        performConversion(
            dateTimeInput.value, // Use the same input time as the global converter
            usFromSelect.value,
            usToSelect.value,
            usConvertedTime,
            usConvertedDate
        );
    }
    // --- 4. Current Time Display (Live Tickers) ---
    function updateCurrentTimes() {
        const zonesToShow = {
            "PST": globalZones["PST / PDT (Los Angeles)"],
            "IST": globalZones["IST (Chennai)"],
            "UTC": globalZones["UTC (Coordinated Universal Time)"]
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
        el.addEventListener("change", () => {
            convertTime();
            convertUSTime(); // Run US conversion when global inputs change
        })
    );
    // US specific listeners
    document.querySelectorAll("#usFromZone, #usToZone").forEach(el =>
        el.addEventListener("change", convertUSTime)
    );
    // Initialize
    initializeTheme();
    convertTime();
    convertUSTime(); // Run initial US conversion
    updateCurrentTimes();
    setInterval(updateCurrentTimes, 1000);
});







