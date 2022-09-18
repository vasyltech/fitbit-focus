import document from "document";
import sleep from "sleep";
import Buzzer from './buzzer';

// Reference to the number of reminders triggered today
const reminders = document.getElementById("reminders");

let CheckInterval = null;

function StartReminder(context) {
    CheckInterval = setInterval(function() {
        const now    = new Date();
        const hour   = now.getHours();
        const minute = now.getMinutes();
        const comp   = hour * 60 + minute;
        const time   = now.getTime() - (now.getTime() % 60000);

        if (hour === 5 && minute === 0) {
            context.setItem("reminderCount", 0);
        }

        if (sleep.state === "awake" || context.settings.fullday_reminder) {
            if (comp % context.settings.reminder_frequency === 0) {
                if (context.getItem("lastReminder") !== time) {
                    Buzzer[context.settings.reminder_behavior]();

                    context.incrementItem("reminderCount");
                    context.setItem("lastReminder", time);
                }
            }
        }
    }, 10000)
}

function StopReminder() {
    CheckInterval = clearInterval(CheckInterval);
}

function UpdateReminderCounter(iconId, count) {
    reminders.text = count;

    // Size of the metric group
    const group = document.getElementById("root").getBBox().width * 0.6 / 2;
    const width = 36 + reminders.getBBox().width;
    const start = group + (group - width) / 2;

    // Set the position of the icon and number
    document.getElementById(iconId).x = Math.floor(start);
    reminders.x = Math.floor(start) + 36;
}

function RenderReminderCounter(context) {
    const status = context.getItem("pause_reminder", false);

    // Let's hide all the icons first
    document.getElementsByClassName("reminder-icon").forEach((icon) => {
        icon.style.display = "none";
    });

    // Let's display the active icon
    if (status) {
        document.getElementById("reminder-off").style.display = "inline";
        UpdateReminderCounter("reminder-off", "--");
    } else {
        document.getElementById("reminder-on").style.display = "inline";
        UpdateReminderCounter(
            "reminder-on",
            context.getItem("reminderCount", 0).toString()
        );
    }
}

export default {
    setup: (context) => {
        StartReminder(context);

        // Set the initial reminder counter
        const lastReminder = context.getItem("lastReminder", null);

        // Either the app starts first time or last reminder was more than a day ago
        if (lastReminder === null || ((new Date).getTime() - lastReminder > 86400000)) {
            context.setItem("reminderCount", 0);
        }

        RenderReminderCounter(context);

        // Register settings change listener
        context.addEventListener("settings_updated", () => {
            StopReminder(); // Clearing current check interval

            // Registering new check interval based on new settings
            StartReminder(context);

            // Resetting the goal counter
            context.setItem("reminderCount", 0);
        });

        // Register data change listener
        context.addEventListener("data_updated", (event) => {
            if (event.data.name === "reminderCount") {
                UpdateReminderCounter("reminder-on", event.data.value.toString());
            } else if (event.data.name === "pause_reminder") {
                if (event.data.value) {
                    StopReminder(); // Clearing current check interval
                } else {
                    StartReminder(context);
                }
            }
        });

        // Listen for the goal completion event
        context.addEventListener("goal_completed", () => {
            StopReminder(); // Clearing current check interval
        });

        // Turn on/off reminder
        const container = document.getElementById("reminder-container");

        container.addEventListener("click", () => {
            const status = !context.getItem("pause_reminder", false);

            context.setItem("pause_reminder", status);

            RenderReminderCounter(context);
        });

    }
}