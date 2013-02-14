define(
[
    "TP",
    "jqueryui/dialog",
    "hbs!templates/views/workoutQuickView",
    "hbs!templates/views/quickView/workoutStatsRow",
    "hbs!templates/views/quickView/workoutStatsRowMinMaxAvg"

],
function(TP, dialog, workoutQuickViewTemplate, workoutStatsRowTemplate, workoutStatsRowMinMavAvgTemplate)
{
    return TP.ItemView.extend(
    {
        template:
        {
            type: "handlebars",
            template: workoutQuickViewTemplate
        },

        bindings:
            
        {
            "#workoutTitleField":
            {
                observe: "Title",
                eventsOverride: [ "blur" ]
            },
            "#distanceCompletedField":
            {
                observe: "Distance",
                eventsOverride: [ "blur" ]
            },
            "#distancePlannedField":
            {
                observe: "DistancePlanned",
                eventsOverride: ["blur"]
            },
            "#TSSPlannedField":
            {
                observe: "TSSPlanned",
                eventsOverride: ["blur"]
            },
            "#TSSCompletedField":
            {
                observe: "TSSActual",
                eventsOverride: ["blur"]
            },
            "#normalizedPacePlannedField":
            {
                observe: "NormalizedSpeedActual",
                eventsOverride: ["blur"]
            },
            "#averagePacePlannedField":
            {
                observe: "VelocityPlanned",
                eventsOverride: ["blur"]
            },
            "#averagePaceCompletedField":
            {
                observe: "VelocityAverage",
                eventsOverride: ["blur"]
            },
            "#averageSpeedPlannedField":
            {
                observe: "VelocityPlanned",
                eventsOverride: ["blur"]
            },
            "#averageSpeedCompletedField":
            {
                observe: "VelocityAverage",
                eventsOverride: ["blur"]
            },
            "#caloriesPlannedField":
            {
                observe: "CaloriesPlanned",
                eventsOverride: ["blur"]
            },
            "#caloriesCompletedField":
            {
                observe: "Calories",
                eventsOverride: ["blur"]
            },
            "#elevationGainPlannedField":
            {
                observe: "ElevationGainPlanned",
                eventsOverride: ["blur"]
            },
            "#elevationGainCompletedField":
            {
                observe: "ElevationGain",
                eventsOverride: ["blur"]
            },
            "#elevationLossCompletedField":
            {
                observe: "ElevationLoss",
                eventsOverride: ["blur"]
            },
            "#IFPlannedField":
            {
                observe: "IFPlanned",
                eventsOverride: ["blur"]
            },
            "#IFCompletedField":
            {
                observe: "IF",
                eventsOverride: ["blur"]
            },
            "#energyPlannedField":
            {
                observe: "EnergyPlanned",
                eventsOverride: ["blur"]
            },
            "#energyCompletedField":
            {
                observe: "Energy",
                eventsOverride: ["blur"]
            },

            //min/max/avg
            "#powerAvgField":
            {
                observe: "PowerAverage",
                eventsOverride: ["blur"]
            },
            "#powerMaxField":
            {
                observe: "PowerMaximum",
                eventsOverride: ["blur"]
            },
            "#torqueAvgField":
            {
                observe: "TorqueAverage",
                eventsOverride: ["blur"]
            },
            "#torqueMaxField":
            {
                observe: "TorqueMaximum",
                eventsOverride: ["blur"]
            },
            "#elevationMinField":
            {
                observe: "ElevationMinimum",
                eventsOverride: ["blur"]
            },
            "#elevationAvgField":
            {
                observe: "ElevationAverage",
                eventsOverride: ["blur"]
            },
            "#elevationMaxField":
            {
                observe: "ElevationMaximum",
                eventsOverride: ["blur"]
            },
            "#cadenceAvgField":
            {
                observe: "CadenceAverage",
                eventsOverride: ["blur"]
            },
            "#cadenceMaxField":
            {
                observe: "CadenceMaximum",
                eventsOverride: ["blur"]
            },
            "#speedAvgField":
            {
                observe: "VelocityAverage",
                eventsOverride: ["blur"]
            },
            "#speedMaxField":
            {
                observe: "VelocityMaximum",
                eventsOverride: ["blur"]
            },
            "#paceMinField":
            {
                observe: "IF",
                eventsOverride: ["blur"]
            },
            "#paceAvgField":
            {
                observe: "VelocityAverage",
                eventsOverride: ["blur"]
            },
            "#paceMaxField":
            {
                observe: "VelocityMaximum",
                eventsOverride: ["blur"]
            },
            "#heartRateMinField":
            {
                observe: "HeartRateMinimum",
                eventsOverride: ["blur"]
            },
            "#heartRateAvgField":
            {
                observe: "HeartRateAverage",
                eventsOverride: ["blur"]
            },
            "#heartRateMaxField":
            {
                observe: "HeartRateMaximum",
                eventsOverride: ["blur"]
            },
            "#TempMin":
            {
                observe: "TempMin",
                eventsOverride: ["blur"]
            },
            "#tempAvgField":
            {
                observe: "TempAvg",
                eventsOverride: ["blur"]
            },
            "#tempMaxField":
            {
                observe: "TempMax",
                eventsOverride: ["blur"]
            }

        },

        onBeforeRender: function ()
        {
            var self = this;
           
            this.$el.dialog(
            {
                autoOpen: false,
                modal: true,
                width: 800,
                height: 600,
                buttons:
                {
                    "Save": function ()
                    {
                        self.$el.dialog("close");
                        self.close();
                    },
                    "Cancel": function ()
                    {
                        self.$el.dialog("close");
                        self.close();
                    }
                }
            });

            
        },
        onRender: function ()
        {
            this.$el.dialog("open");

            this.setupPlannedCompletedView();
            this.setupMinMaxAvgView();

            this.stickit();
        },

        setupPlannedCompletedView: function()
        {
            var workoutStatsPlannedCompleted =
            [
                "distance",
                "normalizedPace",
                "averagePace",
                "averageSpeed",
                "calories",
                "elevationGain",
                "elevationLoss",
                "TSS",
                "IF",
                "energy"
            ];

            var workoutStatsHtml = "";
            for (var i = 0; i < workoutStatsPlannedCompleted.length; i++)
            {
                workoutStatsHtml += workoutStatsRowTemplate({ statName: workoutStatsPlannedCompleted[i], workoutStatsLabel: this.workoutStatLabel(i), workoutStatsUnitLabel: "" });
            }
            this.$("#workoutPlannedCompletedStats").html(workoutStatsHtml);
        },

        setupMinMaxAvgView: function()
        {
            var workoutStatsMinMaxAvg =
            [
                "power",
                "torque",
                "elevation",
                "cadence",
                "speed",
                "pace",
                "heartRate",
                "temp"];

            var workoutStatsHtml = "";
            for (var i = 0; i < workoutStatsMinMaxAvg.length; i++)
            {
                workoutStatsHtml += workoutStatsRowMinMavAvgTemplate({ statName:workoutStatsMinMaxAvg[i], minMaxAvgLabel: workoutStatsMinMaxAvg[i], minMaxAvgUnitsLabel: "lightyears" });
            }
            this.$("#workoutMinMaxAvgStats").html(workoutStatsHtml);
        },

        workoutStatLabel: function (i)
        {
            var label = "";
            switch (i)
            {
                case 0:
                    label = "Distance";
                    break;
                case 1:
                    label = "Normalized Pace";
                    break;
                case 2:
                    label = "Average Pace";
                    break;
                case 3:
                    label = "Average Speed";
                    break;
                case 4:
                    label = "Calories";
                    break;
                case 5:
                    label = "Elevation Gain";
                    break;
                case 6:
                    label = "Elevation Loss";
                    break;
                case 7:
                    label = "TSS";
                    break;
                case 8:
                    label = "IF";
                    break;
                case 9:
                    label = "Energy";
                    break;
            }
            return label;
        },

        getMinMaxAvgLabel: function (i)
        {
            switch (i)
            {
                case 0:
                    minMaxAvgLabelText = "Normalized Power";
                    break;
                case 1:
                    minMaxAvgLabelText = "Power";
                    break;
                case 2:
                    minMaxAvgLabelText = "Torque";
                    break;
                case 3:
                    minMaxAvgLabelText = "Elevation";
                    break;
                case 4:
                    minMaxAvgLabelText = "Cadence";
                    break;
                case 5:
                    minMaxAvgLabelText = "Speed";
                    break;
                case 6:
                    minMaxAvgLabelText = "Pace";
                    break;
                case 7:
                    minMaxAvgLabelText = "HeartRate";
                    break;
                case 8:
                    minMaxAvgLabelText = "Temp";
                    break;
            }
        }

    });
});