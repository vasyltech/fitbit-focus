import * as fs from "fs";

// Collection of default values for the app to work out-of-box
const SETTINGS_FILENAME          = "settings.json"; // ClockFace settings
const APP_DATA_FILENAME          = "data.json";     // ClockFace running properties
const DEFAULT_DURATION           = 30;              // Focus duration in days
const DEFAULT_FOCUS_STATUS       = "active";        // Current focus status
const DEFAULT_REMINDER_BEHAVIOR  = "trinity";       // Reminder behavior
const DEFAULT_REMINDER_FREQUENCY = 60;              // Reminder frequency in minutes

class Context extends EventTarget {

    /**
     * Context construct
     *
     * Reading data from the local file storage and instantiate the context
     */
    constructor() {
        super();

        // Getting app settings first
        if (fs.existsSync(SETTINGS_FILENAME)) {
            this.setSettings(fs.readFileSync(SETTINGS_FILENAME, "json"));
        } else {
            this.setSettings({
                duration: DEFAULT_DURATION,
                reminder_behavior: "trinity",
                reminder_frequency: 60
            });
        }

        // Get app data next
        if (fs.existsSync(APP_DATA_FILENAME)) {
            this._data = fs.readFileSync(APP_DATA_FILENAME, "json");
        } else {
            this._data = {
                reminderCount: 0,
                lastReminder: null
            }
        }
    }

    setSettings(settings = null) {
        this._settings = {
            start: settings.start ?? (new Date()).getTime(),
            focus_status: settings.focus_status ?? DEFAULT_FOCUS_STATUS,
            duration: settings.duration ?? DEFAULT_DURATION,
            reminder_behavior: settings.reminder_behavior ?? DEFAULT_REMINDER_BEHAVIOR,
            reminder_frequency: settings.reminder_frequency ?? DEFAULT_REMINDER_FREQUENCY
        };

        // Persisting settings
        fs.writeFileSync(SETTINGS_FILENAME, this._settings, "json");

        // Letting all listeners know that settings have been updated
        this.dispatchEvent({ type: "settings_updated" });
    }

    setSetting(name, value) {
        this._settings[name] = value;

        // Persisting settings
        fs.writeFileSync(SETTINGS_FILENAME, this._settings, "json");

        // Letting all listeners know that a specific setting has been updated
        this.dispatchEvent({ type: "setting_updated", data: { name, value } });
    }

    getSetting(name, def = undefined) {
        return this._settings[name] ?? def;
    }

    setProp(name, value) {
        this._data[name] = value;

        // Persisting data
        fs.writeFileSync(APP_DATA_FILENAME, this._data, "json");

        // Emit event
        this.dispatchEvent({
            type: "prop_updated",
            data: {
                name,
                value
            }
        });

        return value;
    }

    getProp(name, def = undefined) {
        return this._data[name] ?? def;
    }

    incrementProp(name) {
        return this.setProp(name, this.getProp(name, 0) + 1);
    }

}

// Initializing a single instance of the context
export default new Context();