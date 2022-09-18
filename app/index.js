import Buzzer from "./buzzer";
import Reminder from "./reminder";
import Clock from "./clock";
import Progress from "./progress";
import Context from "./context";
import Metric from "./metric";
import Appearance from "./appearance";
import * as messaging from "messaging";

// Messenger between companion and device
messaging.peerSocket.addEventListener("message", (event) => {
    if (event && event.data) {
        if (event.data.type === "reminder_behavior") {
            Buzzer[event.data.value]();
        } else if (event.data.type === "reset") {
            Context.setSettings({
                duration: parseInt(event.data.duration, 10),
                fullday_reminder: event.data.fullday_reminder,
                start_reminder: parseInt(event.data.start_reminder, 10),
                end_reminder: parseInt(event.data.end_reminder, 10),
                reminder_behavior: event.data.reminder_behavior,
                reminder_frequency: parseInt(event.data.reminder_frequency, 10),
            });

            Buzzer.nudge();
        } else if (event.data.type === "color_changed") {
            Context.setAppearance("color", event.data.value);
        }
    }
});

// Setup the application
Appearance.setup(Context);
Clock.setup(Context);
Reminder.setup(Context);
Progress.setup(Context);
Metric.setup(Context);