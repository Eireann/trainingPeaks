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
            "Torque": "#BDBDBD",
            "Distance": "#7b1F40",
            "Time": "#2ac8f4"
        },

        seriesDarkColorByChannel:
        {
            "HeartRate": "#7f0901",
            "Power": "#909",
        },

        seriesLightColorByChannel:
        {
            "HeartRate": "#fe594d",
            "Power": "#f6f",
            "Elevation": "#7cb9ee",
            "Speed": "#13e600",
            "Time": "#8be1f9"
        },

        seriesColorByUnit:
        {
            "distance": "#7b1F40",
            "duration": "#84979C",
            "calories": "#00f"
        },

        pmcColors:
            {
                IF: "#3399ff",
                TSB: "#FFA500",
                TSBFill: "rgba(255,165,0, 0.4)",
                ATL: "#f945d7",
                CTL: "#38709a",
                TSS: "#b90807",
                ctlGradient: { dark: "rgba(0,75,131,0.4)", light: "rgba(234,235,236,0.4)" },
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
                    heartrate: "rgb(184, 36, 16)",
                    power: "rgb(90, 7, 146)",
                    speed: "rgb(18, 86, 137)"
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
            TSS: { light: "#df0a08", dark: "#b90807" },
            IF: { light: "#5aadff", dark: "#3399ff" },
            bars: { light: "rgb(27, 130, 206)", dark: "#115282"},
            plannedCompleted: {
                defaults: {
                    plannedGreaterThanCompleted: { light: "#c8c8c8", dark: "#adadad"},
                    completed: { light: "#4F9CD6", dark: "#47789D"},
                    completedGreaterThanPlanned: { light: "#1B82CE", dark: "#115282"}
                },
                bike: {
                    completed: { light: "#a153d8", dark: "#7b4a9e" },
                    completedGreaterThanPlanned: { light: "#8820d1", dark: "#561484" }
                },
                strength: {
                    completed: { light: "#a75ca3", dark: "#80507d" },
                    completedGreaterThanPlanned: { light: "#912c8a", dark: "#551a51" }
                },
                run: {
                    completed: { light: "#5f9cb0", dark: "#517885" },
                    completedGreaterThanPlanned: { light: "#30819c", dark: "#1e5162" }
                },
                swim: {
                    completed: { light: "#53b5d8", dark: "#4a889e" },
                    completedGreaterThanPlanned: { light: "#20a3d1", dark: "#0382b1" }
                },
                brick: {
                    completed: { light: "#ba5b7c", dark: "#9a536d" },
                    completedGreaterThanPlanned: { light: "#aa2b58", dark: "#7b1f40" }
                },
                crosstrain: {
                    completed: { light: "#cb4bd2", dark: "#a848ad" },
                    completedGreaterThanPlanned: { light: "#c116c9", dark: "#8e1094" }
                },
                race: {
                    completed: { light: "#3bc4c5", dark: "#3b9c9c" },
                    completedGreaterThanPlanned: { light: "#00b7b7", dark: "#007c7c" }
                },
                mountainbike: {
                    completed: { light: "#ad8f67", dark: "#907a5c" },
                    completedGreaterThanPlanned: { light: "#99703a", dark: "#6e512a" }
                },
                custom: {
                    completed: { light: "#cb4bd2", dark: "#a848ad" },
                    completedGreaterThanPlanned: { light: "#c116c9", dark: "#8e1094" }
                },
                xcski: {
                    completed: { light: "#e09f86", dark: "#d98565" },
                    completedGreaterThanPlanned: { light: "#dd8663", dark: "#d26033" }
                },
                rowing: {
                    completed: { light: "#67d0ed", dark: "#4cc0e0" },
                    completedGreaterThanPlanned: { light: "#3bc7ed", dark: "#14afd9" }
                },
                walk: {
                    completed: { light: "#e7dc3c", dark: "#bfb73c" },
                    completedGreaterThanPlanned: { light: "#e6d701", dark: "#aba001" }
                },
                other: {
                    completed: { light: "#cb4bd2", dark: "#a848ad" },
                    completedGreaterThanPlanned: { light: "#c116c9", dark: "#8e1094" }
                },
                dayoff: {
                    completed: { light: "#b6c1c4", dark: "#a0aeb2" },
                    completedGreaterThanPlanned: { light: "#a5b3b6", dark: "#84979c" }
                }
            }
        },

        chartSelection: "#e61101",
        chartPrimarySelection: "#4580bf",

        mapRoute: "#005695",
        mapSelection: "#e61101",
        mapPrimarySelection: "#95d2ff"
    };

});
