import { settingsStorage } from "settings";
import * as messaging from "messaging";

function sendMessage(data) {
    // If we have a MessageSocket, send the data to the device
    if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
        messaging.peerSocket.send(data);
    } else {
        console.log("No peerSocket connection");
    }
}

// Event fires when a setting is changed
settingsStorage.addEventListener("change", (event) => {
    // Send the type of reminder so user can experience it before setting
    if (event.key === 'reminder_behavior') {
        const setting = JSON.parse(event.newValue);
        sendMessage({
            type: 'reminder_behavior',
            value: setting.values[0].value
        });
    } else if (event.key === 'set') { // Set the new goal
        sendMessage({
            type: 'reset',
            duration: parseInt(settingsStorage.getItem('duration'), 10),
            fullday_reminder: settingsStorage.getItem('fullday_reminder') === "true",
            reminder_behavior: JSON.parse(
                settingsStorage.getItem('reminder_behavior')
            ).values[0].value,
            reminder_frequency: parseInt(JSON.parse(
                settingsStorage.getItem('reminder_frequency')
            ).values[0].value, 10)
        });
    } else if (event.key === "color") {
        const setting = JSON.parse(event.newValue);

        sendMessage({
            type: 'color_changed',
            value: parseInt(setting, 10)
        });
    }
});
