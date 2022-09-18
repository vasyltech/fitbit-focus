import clock from "clock";
import document from "document";

const progress = document.getElementById("progress");
const base     = document.getElementById("progress-base");

function AdjustProgress(context) {
    // Calculate the size
    const now      = new Date();
    const start    = context.settings.start;
    const duration = context.settings.duration;
    const size     = (now.getTime() - start) / (duration * 86400000);

    if (size < 1) {
        progress.x2         = base.getBBox().width * size;
    } else {
        progress.x2 = base.getBBox().width;

        // Notifying the other components that the goal has been accomplished
        context.dispatchEvent({type: "goal_completed"});
    }
}

export default {
    setup: (context) => {
        // Register the clock
        clock.granularity = "seconds";
        clock.addEventListener("tick", () => {
            AdjustProgress(context);
        });

        // Register settings change listener
        context.addEventListener(
            "settings_updated",
            () => AdjustProgress(context)
        );
    }
}