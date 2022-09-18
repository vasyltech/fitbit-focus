import * as fs from "fs";

const SETTINGS_FILENAME = "settings.json";
const APP_DATA_FILENAME = "data.json";
const DEFAULT_DURATION = 30;
const DEFAULT_REMINDER_BEHAVIOR = "trinity";
const DEFAULT_REMINDER_FREQUENCY = 60;

class Context extends EventTarget {

    get settings() {
        return this._settings;
    }

    /**
     *
     */
    setup() {
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
            duration: settings.duration ?? DEFAULT_DURATION,
            fullday_reminder: settings.fullday_reminder ?? false,
            reminder_behavior: settings.reminder_behavior ?? DEFAULT_REMINDER_BEHAVIOR,
            reminder_frequency: settings.reminder_frequency ?? DEFAULT_REMINDER_FREQUENCY,
        }

        // Persisting settings
        fs.writeFileSync(SETTINGS_FILENAME, this._settings, "json");

        // Letting all listeners to know that settings have been updated
        this.dispatchEvent({type: "settings_updated"});
    }

    setItem(name, value) {
        this._data[name] = value;

        // Persisting data
        fs.writeFileSync(APP_DATA_FILENAME, this._data, "json");

        // Emit event
        this.dispatchEvent({
            type: "data_updated",
            data: {
                name,
                value
            }
        });

        return value;
    }

    getItem(name, def = undefined) {
        return this._data[name] ?? def;
    }

    incrementItem(name) {
        this._data[name] = this.getItem(name, 0) + 1;

        return this._data[name];
    }

    setAppearance(name, value) {
        this.setItem(name, value);
    }
}

// Initializing a single instance of the context
const ContextInstance = new Context();
ContextInstance.setup();

export default ContextInstance;