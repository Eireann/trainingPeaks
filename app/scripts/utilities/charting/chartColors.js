define(
[
],
function()
{
    return {

        seriesColorByChannel:
            {
                "HeartRate": "#e61101",
                "Cadence": "#FFA500",
                "Power": "#FF00FF",
                "RightPower": "#FF00FF",
                "PowerBalance": "#FF00FF",
                "Speed": "#0b8200",
                "Elevation": "#6e96b9",
                "Temperature": "#0A0AFF",
                "Torque": "#BDBDBD"
            },

        gradients:
            {
                heartRate: { light: "#ED3F1D", dark: "#B50F00" },
                power: { light: "#8106C9", dark: "#590888" },
                pace: { light: "#0E7FCF", dark: "#0B568D" },
                //elevation: { light: "rgba(202, 233, 251, 0.5)", dark: "rgba(110, 150, 185, 0.6)" }
                elevation: { light: "#cae9fb", dark: "#6e96b9" }
            },

        chartSelection: "#e61101",

        mapRoute: "#005695",
        mapSelection: "#e61101"
    };

});