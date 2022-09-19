import document from "document";
import sleep from "sleep";
import Buzzer from './buzzer';

// Reference to the number of reminders triggered today
const reminders = document.getElementById("reminders");

// Order of reminder statuses
const Statuses = [
    "on",   // Reminder is on when user is awake
    "off",  // Reminder if off no matter what
    "zzz"   // Reminder is on when user is either awake or asleep
]

let CheckInterval;

function StartReminder(context) {
    if (CheckInterval === undefined) {
        CheckInterval = setInterval(function() {
            const now    = new Date();
            const hour   = now.getHours();
            const minute = now.getMinutes();
            const comp   = hour * 60 + minute;
            const time   = now.getTime() - (now.getTime() % 60000);

            if (hour === 5 && minute === 0) {
                context.setProp("reminderCount", 0);
            }

            if (sleep.state === "awake"
                    || context.getProp("reminder_status") === "zzz"
            ) {
                if (comp % context.getSetting("reminder_frequency") === 0) {
                    if (context.getProp("lastReminder") !== time) {
                        Buzzer[context.getSetting("reminder_behavior")]();

                        context.incrementProp("reminderCount");
                        context.setProp("lastReminder", time);
                    }
                }
            }
        }, 10000);
    }
}

function StopReminder() {
    if (CheckInterval !== undefined) {
        CheckInterval = clearInterval(CheckInterval);
    }
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
    const status = context.getProp("reminder_status", Statuses[0]);

    // Let's hide all the icons first
    document.getElementsByClassName("reminder-icon").forEach((icon) => {
        icon.style.display = "none";
    });

    // Let's display the active icon
    document.getElementById(`reminder-${status}`).style.display = "inline";

    if (status === "off") {
        UpdateReminderCounter(
            "reminder-off",
            context.getSetting("focus_status") === "active" ? "--" : "END"
        );
    } else {
        UpdateReminderCounter(
            `reminder-${status}`,
            context.getProp("reminderCount", 0).toString()
        );
    }
}

export default {
    setup: (context) => {
        // Register settings change listener
        context.addEventListener("settings_updated", () => {
            StopReminder(); // Clearing current check interval

            // Registering new check interval based on new settings
            StartReminder(context);

            // Resetting the reminder counter
            context.setProp("reminderCount", 0);

            // Reset the reminder status back to on
            context.setProp("reminder_status", "on");
        });

        // Register data change listener
        context.addEventListener("prop_updated", (event) => {
            if (event.data.name === "reminderCount") {
                UpdateReminderCounter("reminder-on", event.data.value.toString());
            } else if (event.data.name === "reminder_status") {
                if (event.data.value === "off") {
                    StopReminder(); // Clearing current check interval
                } else {
                    StartReminder(context);
                }

                RenderReminderCounter(context);
            }
        });

        // Register an individual setting update
        context.addEventListener("setting_updated", (event) => {
            if (event.data.name === "focus_status"
                    && event.data.value === "inactive"
            ) {
                StopReminder(); // Clearing current check interval
                context.setProp("reminder_status", "off");
            }
        });

        if (context.getSetting("focus_status") === "active") {
            StartReminder(context);

            // Set the initial reminder counter
            const lastReminder = context.getProp("lastReminder", null);

            // Either the app starts first time or last reminder was more than a day ago
            if (lastReminder === null || ((new Date).getTime() - lastReminder > 86400000)) {
                context.setProp("reminderCount", 0);
            }

            // Turn on/off reminder
            const container = document.getElementById("reminder-container");

            container.addEventListener("click", () => {
                const currentStatus = context.getProp("reminder_status", Statuses[0]);
                const index         = Statuses.indexOf(currentStatus);

                if (index + 1 < Statuses.length) {
                    context.setProp("reminder_status", Statuses[index + 1]);
                } else {
                    context.setProp("reminder_status", Statuses[0]);
                }

                RenderReminderCounter(context);
            });

            RenderReminderCounter(context);
        } else {
            context.setProp("reminder_status", "off");
        }
    }
}