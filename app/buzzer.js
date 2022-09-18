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

export default {
    trinity: () => Buzz(3),
    double: () => Buzz(2),
    nudge: () => Buzz(1),
    ring: () => Buzz(1, "ring", 3400),
    bump: () => Buzz(6, "bump", 200),
    ping: () => Buzz(4, "ping", 500)
}