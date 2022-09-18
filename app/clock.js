import clock from "clock";
import { preferences } from "user-settings";
import document from "document";

// Locales for month
const Months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const Day = [
    'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri',
    'Sat'
];

const date     = document.getElementById("date");
const hour1    = document.getElementById("hour1");
const hour2    = document.getElementById("hour2");
const minute1  = document.getElementById("minute1");
const minute2  = document.getElementById("minute2");

function ZeroPad(number) {
    return number <  10 ? '0' + number : number;
}

function UpdateStats(event) {
    let today = event.date;

    // Preparing the current date
    date.text = Day[today.getDay()] + ', ' + Months[today.getMonth()] + ' ' + ZeroPad(today.getDate());

    // Preparing the hours
    if (preferences.clockDisplay === "12h") {
        const hours = today.getHours() % 12 || 12;

        hour1.text = hours < 10 ? 0 : 1;
        hour2.text = hours % 10;
    } else {
        hour1.text   = Math.floor(today.getHours() / 10);
        hour2.text   = today.getHours() % 10;
    }

    // Preparing minutes
    minute1.text = Math.floor(today.getMinutes() / 10);
    minute2.text = today.getMinutes() % 10;
}

export default {
    setup: () => {
        // Register the clock
        clock.granularity = "seconds";
        clock.addEventListener("tick", (event) => {
            UpdateStats(event);
        });
    }
}