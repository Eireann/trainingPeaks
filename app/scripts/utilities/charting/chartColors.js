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
                "Speed": "#0b8200",
                "Elevation": "#6e96b9",
                "Temperature": "#0A0AFF",
                "Torque": "#BDBDBD"
            },

        pmcColors:
            {
                TSS: "#e61101",
                TSB: "#FFA500",
                ATL: "#E38AAE",
                CTL: "#1b82ce",
                IF: "#6e96b9"
            },

        gradients:
            {
                heartRate: { light: "#ec412b", dark: "#b82410" },
                power: { light: "#880add", dark: "#5a0792" },
                pace: { light: "#1b82ce", dark: "#125689" },
                //elevation: { light: "rgba(202, 233, 251, 0.5)", dark: "rgba(110, 150, 185, 0.6)" }
                elevation: { light: "#cae9fb", dark: "#6e96b9" }
            },

        chartSelection: "#e61101",

        mapRoute: "#005695",
        mapSelection: "#e61101"
    };

});