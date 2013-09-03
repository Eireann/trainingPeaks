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
                CTL: "#38709a",
                TSS: "#b90807",
                ctlGradient: { dark: "#99b7cd", light: "#eaebec" },
                futureCTLGradient: { dark: "#a6a9ad", light: "#f4f5f5" },
                tsbGradient: { dark: "rgba(234, 235, 236, 0.4)", light: "rgba(255,165,0, 0.4)" }
            },

        gradients:
            {
                heartRate: { light: "#ec412b", dark: "#b82410" },
                power: { light: "#880add", dark: "#5a0792" },
                pace: { light: "#1b82ce", dark: "#125689" },
                //elevation: { light: "rgba(202, 233, 251, 0.5)", dark: "rgba(110, 150, 185, 0.6)" }
                elevation: { light: "#cae9fb", dark: "#6e96b9" },
                cadence: {light: "#ffcc00", dark:"#ffa500" },
                workoutType:
                    {
                        bike: { light: "#8820d1", dark: "#561484" },
                        strength: { light: "#912c8a", dark: "#551a51" },
                        run: { light: "#30819c", dark: "#1e5162" },
                        swim: { light: "#20a3d1", dark: "#0382b1" },
                        brick: { light: "#aa2b58", dark: "#7b1f40" },
                        crosstrain: { light: "#c116c9", dark: "#8e1094" },
                        race: { light: "#00b7b7", dark: "#007c7c" },
                        mountainbike: { light: "#99703a", dark: "#6e512a" },
                        custom: { light: "#c116c9", dark: "#8e1094" },
                        xcski: { light: "#dd8663", dark: "#d26033" },
                        rowing: { light: "#3bc7ed", dark: "#14afd9" },
                        walk: { light: "#e6d701", dark: "#aba001" },
                        other: { light: "#c116c9", dark: "#8e1094" },
                        dayoff: { light: "#a5b3b6", dark: "#84979c" } 
                    },
                trainingZones:
                {
                    heartrate: "rgba(184, 36, 16, $$)",
                    power: "rgba(90, 7, 146, $$)",
                    speed: "rgba(18, 86, 137, $$)"
                }
            },
        peaks:
        {
            heartRate: { light: "rgba(236, 65, 43, 0.6)", dark: "rgba(184, 36, 16, 0.6)" },
            power: { light: "rgba(136, 10, 221, 0.6)", dark: "rgba(90, 7, 146, 0.6)" },
            pace: { light: "rgba(27, 130, 206, 0.6)", dark: "rgba(18, 86, 137, 0.6)" },
            cadence: { light: "rgba(255, 204, 0, 0.6)", dark: "rgba(255, 165, 0, 0.6)" },
            comparison: { light: "rgba(191, 189, 190, 0.8)", dark: "rgba(136, 135, 136, 0.8)" }
        },

        workoutSummary:
        {
            planned: "#adadad",
            bars: { light: "#1b82ce", dark: "#125689" },
            tss: { light: "#df0a08", dark: "#b90807" },
            if: { light: "#5aadff", dark: "#3399ff" }
        },

        chartSelection: "#e61101",

        mapRoute: "#005695",
        mapSelection: "#e61101"
    };

});
