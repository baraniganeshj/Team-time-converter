document.addEventListener('DOMContentLoaded', () => {
    // --- ZONE DEFINITIONS ---
    const globalZones = {
        "PST / PDT (Los Angeles)": "America/Los_Angeles",
        "EST / EDT (New York)": "America/New_York",
        "IST (Chennai)": "Asia/Kolkata",
        "UTC (Coordinated Universal Time)": "UTC",
        "GMT (London)": "Europe/London",
    };
    const usZones = {
        "Eastern Time (ET) - New York": "America/New_York",
        "Central Time (CT) - Chicago": "America/Chicago",
        "Mountain Time (MT) - Denver": "America/Denver",
        "Pacific Time (PT) - Los Angeles": "America/Los_Angeles",
        "Alaska Time (AKT) - Anchorage": "America/Anchorage",
        "Hawaii Time (HT) - Honolulu": "Pacific/Honolulu",
    };
    // --- ELEMENT REFERENCES ---
    const currentTimesDiv = document.getElementById("currentTimes");
    const themeToggle = document.getElementById("themeToggle");
    const body = document.body;
    // Global Converter Elements
    const global = {
        fromSelect: document.getElementById("fromZone"),
        toSelect: document.getElementById("toZone"),
        dateTimeInput: document.getElementById("dateTimeInput"),
        convertedTime: document.getElementById("convertedTime"),
        convertedDate: document.getElementById("convertedDate"),
        toZoneDisplay: document.getElementById("toZoneDisplay")
    };
    // US Converter Elements (Now fully separate)
    const us = {
        fromSelect: document.getElementById("usFromZone"),
        toSelect: document.getElementById("usToZone"),
        dateTimeInput: document.getElementById("usDateTimeInput"), // NEW DEDICATED INPUT
        convertedTime: document.getElementById("usConvertedTime"),
        convertedDate: document.getElementById("usConvertedDate")
    };
    // --- THEME SWITCHER LOGIC (UNCHANGED) ---
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
    // --- UTILITY: Date Formatting ---
    // Helper function to format date for input[type="datetime-local"]
    function formatToLocalInput(date, timeZone) {
        const year = new Intl.DateTimeFormat('en', { year: 'numeric', timeZone: timeZone }).format(date);
        const month = new Intl.DateTimeFormat('en', { month: '2-digit', timeZone: timeZone }).format(date);
        const day = new Intl.DateTimeFormat('en', { day: '2-digit', timeZone: timeZone }).format(date);
        const hour = new Intl.DateTimeFormat('en', { hour: '2-digit', hourCycle: 'h23', timeZone: timeZone }).format(date);
        const minute = new Intl.DateTimeFormat('en', { minute: '2-digit', timeZone: timeZone }).format(date);
        return `${year}-${month}-${day}T${hour}:${minute}`;
    }
    // --- CORE CONVERSION LOGIC (Reusable) ---
    function performConversion(dateTimeLocal, fromZone, toZone, timeOutputEl, dateOutputEl) {
        if (!dateTimeLocal) {
             timeOutputEl.textContent = "--:--";
             dateOutputEl.textContent = "Select date/time";
             return;
        }
        const parts = dateTimeLocal.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
        if (!parts) return;
        const [_, year, month, day, hour, minute] = parts.map(Number);
        const fromDateString = `${month}/${day}/${year} ${hour}:${minute}:00`;
        // Create the absolute moment in time (UTC epoch) anchored to the FROM zone
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
    // --- GLOBAL CONVERTER MODULE ---
    function initializeGlobalConverter() {
        // 1. Populate Selects
        Object.keys(globalZones).forEach(zoneName => {
            const timeZoneValue = globalZones[zoneName];
            global.fromSelect.add(new Option(zoneName, timeZoneValue));
            global.toSelect.add(new Option(zoneName, timeZoneValue));
        });
        // 2. Set Initial Values & Date
        global.fromSelect.value = globalZones["PST / PDT (Los Angeles)"];
        global.toSelect.value = globalZones["IST (Chennai)"];
        const now = new Date();
        global.dateTimeInput.value = formatToLocalInput(now, global.fromSelect.value);
        // 3. Conversion Function
        function convertGlobalTime() {
            const selectedToOption = global.toSelect.options[global.toSelect.selectedIndex].text;
            global.toZoneDisplay.textContent = selectedToOption.replace(/\s*\(.*\)/, '');
            performConversion(
                global.dateTimeInput.value,
                global.fromSelect.value,
                global.toSelect.value,
                global.convertedTime,
                global.convertedDate
            );
        }
        // 4. Event Listeners
        document.querySelectorAll("#dateTimeInput, #fromZone, #toZone").forEach(el =>
            el.addEventListener("change", convertGlobalTime)
        );
        return convertGlobalTime; // Return the function for initial execution
    }
    // --- US CONVERTER MODULE (FULLY INDEPENDENT) ---
    function initializeUSConverter() {
        // 1. Populate Selects
        Object.keys(usZones).forEach(zoneName => {
            const timeZoneValue = usZones[zoneName];
            us.fromSelect.add(new Option(zoneName, timeZoneValue));
            us.toSelect.add(new Option(zoneName, timeZoneValue));
        });
        // 2. Set Initial Values & Date
        us.fromSelect.value = usZones["Eastern Time (ET) - New York"];
        us.toSelect.value = usZones["Pacific Time (PT) - Los Angeles"];
        const now = new Date();
        // Uses the US 'From' zone to initialize its independent date picker
        us.dateTimeInput.value = formatToLocalInput(now, us.fromSelect.value);
        // 3. Conversion Function
        function convertUSTime() {
            // Note: Does NOT rely on global.dateTimeInput
            performConversion(
                us.dateTimeInput.value,
                us.fromSelect.value,
                us.toSelect.value,
                us.convertedTime,
                us.convertedDate
            );
        }
        // 4. Event Listeners
        document.querySelectorAll("#usDateTimeInput, #usFromZone, #usToZone").forEach(el =>
            el.addEventListener("change", convertUSTime)
        );
        return convertUSTime; // Return the function for initial execution
    }
    // --- LIVE TICKER (UNCHANGED) ---
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
    // --- INITIALIZATION ---
    initializeTheme();
    themeToggle.addEventListener('click', () => {
        if (body.classList.contains('dark-mode')) {
            enableLightMode();
        } else {
            enableDarkMode();
        }
    });
    const runGlobal = initializeGlobalConverter();
    const runUS = initializeUSConverter();
    runGlobal();
    runUS();
    updateCurrentTimes();
    setInterval(updateCurrentTimes, 1000);
});
