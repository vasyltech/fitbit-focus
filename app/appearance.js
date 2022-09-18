import * as document from "document";

function UpdateColor(color) {
    // Let's hide all the icons first
    document.getElementsByClassName("theme-color").forEach((el) => {
        el.style.fill = color;
    });
}

export default {
    setup: (context) => {
        context.addEventListener("data_updated", function(event) {
            if (event.data.name === "color") {
                UpdateColor(event.data.value)
            }
        });

        // Set the default color
        UpdateColor(context.getItem("color", 5080831));
    }
}