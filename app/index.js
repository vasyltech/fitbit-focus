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
        if (event.data.type === "set_focus") {
            Context.setSettings({
                duration: event.data.duration,
                reminder_behavior: event.data.reminder_behavior,
                reminder_frequency: event.data.reminder_frequency,
            });
        } else if (event.data.type === "setting_updated") {
            Context.setSetting(event.data.setting, event.data.value);
        }
    }
});

// Setup the application
Appearance.setup(Context);
Clock.setup(Context);
Reminder.setup(Context);
Progress.setup(Context);
Metric.setup(Context);
Buzzer.setup(Context);