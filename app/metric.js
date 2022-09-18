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

function StartTracker(context) {
    TrackerTimeout = setInterval(function() {
        const metric = context.getItem("active_metric", GetDefaultMetric());

        // Number element
        const number = document.getElementById("metric-number");

        if (metric === "heart") {
            number.text = (HeartRateSensorInstance.heartRate || "--").toString();
        } else if (metric === "activeZoneMinutes") {
            if (today.local.activeZoneMinutes) {
                number.text = today.local.activeZoneMinutes.total.toString();
            } else {
                number.text = "--";
            }
        } else if (metric === "elevationGain") {
            if (today.local.elevationGain !== undefined) {
                number.text = (today.adjusted.elevationGain || "--").toString();
              } else {
                number.text = (today.local.elevationGain || "--").toString();
              }
        } else {
            number.text = (today.local[metric] || "--").toString();
        }

       AdjustIconTextPosition(metric, "metric-number");
    }, 1000);
}

/**
 *
 * @param {*} metric
 */
function StopTracker(context) {
    const metric = context.getItem("active_metric", GetDefaultMetric());

    if (metric === "heart") {
        HeartRateSensorInstance.stop();
    }

    TrackerTimeout = clearInterval(TrackerTimeout);
}

function RenderActiveMetric(context) {
    const metric = context.getItem("active_metric", GetDefaultMetric());

    // Let's hide all the icons first
    document.getElementsByClassName("metric-icon").forEach((icon) => {
        icon.style.display = "none";
    });

    // Let's display the active metric icon
    document.getElementById(metric).style.display = "inline";

    // Resetting the number
    document.getElementById("metric-number").text = "--";

    // Adjust the position
    AdjustIconTextPosition(metric, "metric-number");

    // Start tracking numbers
    if (display.on) {
        if (metric === "heart") {
            HeartRateSensorInstance.start();
        } else {
            HeartRateSensorInstance.stop();
        }

        if (TrackerTimeout === undefined) {
            StartTracker(context);
        }
    }
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

        const container = document.getElementById("metric-container");

        container.addEventListener("click", () => {
            if (++currentMetric >= AllowedMetricData.length) {
                currentMetric = 0;
            }

            context.setItem("active_metric", AllowedMetricData[currentMetric]);

            RenderActiveMetric(context);
        });

        RenderActiveMetric(context);

        display.addEventListener("change", function() {
            if (display.on) {
                StartTracker(context);
            } else {
                StopTracker(context);
            }
        });
    }
}