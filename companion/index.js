import { settingsStorage } from "settings";
import * as messaging from "messaging";

function SendMessage(data) {
    // If we have a MessageSocket, send the data to the device
    if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
        messaging.peerSocket.send(data);
    } else {
        console.log("No peerSocket connection");
    }
}

function GetSelectedValue(name) {
    return JSON.parse(settingsStorage.getItem(name)).values[0].value;
}

// Event fires when a setting is changed
settingsStorage.addEventListener("change", (event) => {
    if (event.key === 'set') { // Set the new goal
        SendMessage({
            type: 'set_focus',
            duration: parseInt(settingsStorage.getItem("duration"), 10),
            reminder_behavior: GetSelectedValue("reminder_behavior"),
            reminder_frequency: parseInt(GetSelectedValue("reminder_frequency"), 10)
        });
    } else {
        let value;

        if (event.key === "color") {
            value = parseInt(JSON.parse(event.newValue), 10)
        } else if (event.key === "reminder_behavior") {
            value = GetSelectedValue("reminder_behavior");
        } else if (event.key === "reminder_frequency") {
            value = parseInt(GetSelectedValue("reminder_frequency"), 10);
        }

        if (value !== undefined) { // Ignore sending message if value not set
            SendMessage({
                type: 'setting_updated',
                setting: event.key,
                value
            });
        }
    }
});
