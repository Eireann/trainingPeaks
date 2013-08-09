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
                IF: "#3399ff",
                TSB: "#FFA500",
                TSBFill: "rgba(255,165,0, 0.4)",
                ATL: "#f945d7",
                CTL: "#ffffff",
                TSS: "#b90807",
                ctlGradient: { dark: "#eaebec", light: "#b5c7d4" },
                futureCTLGradient: { dark: "#eaebec", light: "#cacbcc" },
                tsbGradient: { dark: "rgba(234, 235, 236, 0.4)", light: "rgba(255,165,0, 0.4)" }
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