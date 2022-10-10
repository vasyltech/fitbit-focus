import { me } from "appbit";
import { today, primaryGoal } from "user-activity";
import { display } from "display";
import * as document from "document";
import { HeartRateSensor } from "heart-rate";

const currentMetric     = 0;
const AllowedMetricData = [];

let TrackerTimeout;
let HeartRateSensorInstance;

function GetDefaultMetric() {
    return AllowedMetricData.indexOf(primaryGoal) !== -1 ? primaryGoal : AllowedMetricData[0]
}

function AdjustIconTextPosition(iconId, textId) {
     // Size of the metric group
     const group = document.getElementById("root").getBBox().width * 0.6 / 2;
     const width = 36 + document.getElementById(textId).getBBox().width;
     const start = (group - width) / 2;

     // Set the position of the icon and number
     document.getElementById(iconId).x = Math.floor(start);
     document.getElementById(textId).x = Math.floor(start) + 36;
}

function GetTodayMetric(metric, xpath = null) {
    let value = today.adjusted[metric] ?? today.local[metric];

    if (xpath !== null && value !== undefined) {
        value = value[xpath];
    }

    return value !== undefined ? value.toString() : "--";
}

function StartTrackingInterval(context) {
    if (TrackerTimeout === undefined) {
        TrackerTimeout = setInterval(function() {
            const metric = context.getProp("active_metric", GetDefaultMetric());

            // Number element
            const number = document.getElementById("metric-number");

            if (metric === "heart") {
                number.text = (HeartRateSensorInstance.heartRate || "--").toString();
            } else if (metric === "activeZoneMinutes") {
                number.text = GetTodayMetric(metric, "total");
            } else {
                number.text = GetTodayMetric(metric);
            }

            AdjustIconTextPosition(metric, "metric-number");
        }, 1000);
    }
}

/**
 *
 * @param {*} metric
 */
function StopTrackingInterval(context) {
    const metric = context.getProp("active_metric", GetDefaultMetric());

    if (metric === "heart") {
        HeartRateSensorInstance.stop();
    }

    TrackerTimeout = clearInterval(TrackerTimeout);
}

function InitializeTracker(context) {
    if (display.on) {
        const metric = context.getProp("active_metric", GetDefaultMetric());

        if (metric === "heart") {
            HeartRateSensorInstance.start();
        } else {
            HeartRateSensorInstance.stop();
        }

        StartTrackingInterval(context);
    }
}

function RenderActiveMetric(context) {
    const metric = context.getProp("active_metric", GetDefaultMetric());

    // Let's hide all the icons first
    document.getElementsByClassName("metric-icon").forEach((icon) => {
        icon.style.display = "none";
    });

    // Let's display the active metric icon
    document.getElementById(metric).style.display          = "inline";
    document.getElementById("metric-number").style.display = "inline";

    // Resetting the number
    document.getElementById("metric-number").text = "--";

    // Adjust the position
    AdjustIconTextPosition(metric, "metric-number");

    // Start tracking data
    InitializeTracker(context);

}

export default {
    setup: (context) => {
        if (me.permissions.granted("access_heart_rate")) {
            AllowedMetricData.push("heart");
            HeartRateSensorInstance = new HeartRateSensor();
        }

        if (me.permissions.granted("access_activity")) {
            AllowedMetricData.push("activeZoneMinutes");
            AllowedMetricData.push("calories");
            AllowedMetricData.push("distance");
            AllowedMetricData.push("elevationGain");
            AllowedMetricData.push("steps");
        }

        if (AllowedMetricData.length > 0) {
            const container = document.getElementById("metric-container");

            container.addEventListener("click", () => {
                if (++currentMetric >= AllowedMetricData.length) {
                    currentMetric = 0;
                }

                context.setProp("active_metric", AllowedMetricData[currentMetric]);

                RenderActiveMetric(context);
            });

            // Starting tracker. Keep in mind that starting a tracker in the
            // RenderActiveMetric function is not enough because app can be reloaded
            // at any time
            StartTrackingInterval(context);

            RenderActiveMetric(context);

            display.addEventListener("change", function() {
                if (display.on) {
                    InitializeTracker(context);
                } else {
                    StopTrackingInterval(context);
                }
            });
        }
    }
}