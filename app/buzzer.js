import { vibration } from "haptics";

function Buzz(count, style = "nudge-max", milliseconds = 700) {
    let buzzCount    = 0;
    let buzzInterval = setInterval(function() {
        vibration.start(style);

        if (buzzCount++ >= count) {
            vibration.stop();
            buzzInterval = clearInterval(buzzInterval);
        }

    }, milliseconds);
}

const Buzzer = {
    setup: (context) => {
        context.addEventListener("settings_updated", () => {
            Buzzer.nudge();
        });

        context.addEventListener("setting_updated", (event) => {
            if (event.data.name === "reminder_behavior") {
                Buzzer[event.data.value]();
            }
        });
    },
    trinity: () => Buzz(3),
    double: () => Buzz(2),
    nudge: () => Buzz(1),
    ring: () => Buzz(1, "ring", 3400),
    bump: () => Buzz(6, "bump", 200),
    ping: () => Buzz(4, "ping", 500)
};

export default Buzzer;