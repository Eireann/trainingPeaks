define(
[
    "jqueryTextAreaResize",
    "underscore",
    "moment",
    "TP",
    "utilities/printUnitLabel",
    "utilities/convertToViewUnits",
    "utilities/convertToModelUnits",
    "utilities/printTimeFromDecimalHours",
    "utilities/convertTimeHoursToDecimal",
    "utilities/workoutLayoutFormatter",
    "hbs!templates/views/quickView/summary"
],
function (
    textAreaResize,
    _,
    moment,
    TP,
    printUnitLabel,
    convertToViewUnits,
    convertToModelUnits,
    printTimeFromDecimalHours,
    convertTimeHoursToDecimal,
    workoutLayoutFormatter,
    workoutQuickViewSummaryTemplate)
{
    return TP.ItemView.extend(
    {
        className: "summary",

        today: moment().format("YYYY-MM-DD"),

        showThrobbers: false,

        events:
        {
           
          
        },

        template:
        {
            type: "handlebars",
            template: workoutQuickViewSummaryTemplate
        },

        onRender: function()
        {
            this.$("textarea").autosize({ resize: "none" });
            this.applyUICustomization();

            if (!this.stickitInitialized)
            {
                this.model.off("change", this.render);

                // there is no saveWorkout method ...
                //this.model.on("change", this.saveWorkout, this);

                this.stickit();
                this.stickitInitialized = true;
            }
        },

        applyUICustomization: function ()
        {
            this.applyGhostingForFuture();
            this.applyUserPreferences();

        },

        applyGhostingForFuture: function ()
        {
            if (this.model.getCalendarDay() > this.today)
            {
                this.$(".workoutStatsCompleted input").attr("disabled", true);
                this.$("#workoutMinMaxAvgStats input").attr("disabled", true);
                //apply ghost css attribute
                //this all needs refactored
                this.$("label.workoutStatsCompleted").addClass("ghosted");
                this.$(".columnLabelsMinMaxAvg label").addClass("ghosted");
                this.$("#workoutMinMaxAvgStats label").addClass("ghosted");
                this.$("#workoutMinMaxAvgStats").addClass("ghosted");
            }
        },
        
        applyUserPreferences: function ()
        {
            var statsTree = this.$("#workoutPlannedCompletedStats");
            var summaryTree = this.$("#workoutMinMaxAvgStats");

            var statsTreeClone = statsTree.clone();
            var summaryTreeClone = summaryTree.clone();

            this.applyPreferencesSort(statsTreeClone, summaryTreeClone);
            this.applyPlannedFieldOverrides(statsTreeClone);

            statsTree.replaceWith(statsTreeClone);
            summaryTree.replaceWith(summaryTreeClone);
        },

        applyPreferencesSort: function (statsTree, summaryTree)
        {
            var workoutOrderPreferences = theMarsApp.user.get("settings").workout.layout[this.model.get("workoutTypeValueId")];

            //Process stats and summary order area
            var statsAnchor = statsTree.find("#workoutStatsAnchor");
            var summaryAnchor = summaryTree.find("#workoutSummaryAnchor");
            for (var index = 0; index < workoutOrderPreferences.length; index++)
            {
                var stat = workoutLayoutFormatter[workoutOrderPreferences[index]];
                var statRow = statsTree.find("." + stat + "StatsRow");

                if (statRow !== [])
                {
                    statRow.insertBefore(statsAnchor);
                    statRow.removeClass("hide");
                }

                var summaryRow = summaryTree.find("." + stat + "SummaryRow");

                if (summaryRow !== [])
                {
                    summaryRow.insertBefore(summaryAnchor);
                    summaryRow.removeClass("hide");
                }
            }
        },

        applyPlannedFieldOverrides: function (statsTree)
        {
            var inputsStillHidden = statsTree.find(".workoutStatsRow.hide .workoutStatsPlanned input");

            var self = this;
            inputsStillHidden.each(function ()
            {
                var binding = self.bindings["#" + this.id];
                if (binding)
                {
                    var modelValue = self.model.get(binding.observe);
                    if (modelValue)
                    {
                        $(this).closest(".workoutStatsRow").removeClass("hide");
                    }
                }
            });
        },

        getDistance: function (value, options)
        {
            return convertToViewUnits(value, "distance");
        },

        setDistance: function (value, options)
        {
            return convertToModelUnits(value, "distance");
        },

        getTime: function (value, options)
        {
            return printTimeFromDecimalHours(value);
        },

        setTime: function (value, options)
        {
            return convertTimeHoursToDecimal(value);
        },

        getPace: function (value, options)
        {
            return convertToViewUnits(value, "pace");
        },

        setPace: function (value, options)
        {
            return convertToModelUnits(value, "pace");
        },

        getSpeed: function (value, options)
        {
            return convertToViewUnits(value, "speed");
        },

        setSpeed: function (value, options)
        {
            return convertToModelUnits(value, "speed");
        },

        getElevation: function (value, options)
        {
            return convertToViewUnits(value, "elevation");
        },

        setElevation: function (value, options)
        {
            return convertToModelUnits(value, "elevation");
        },

        bindings:
        {
            "#distanceCompletedField":
            {
                observe: "distance",
                eventsOverride: ["blur"],
                onGet: "getDistance",
                onSet: "setDistance"
            },
            "#distancePlannedField":
            {
                observe: "distancePlanned",
                eventsOverride: ["blur"],
                onGet: "getDistance",
                onSet: "setDistance"
            },
            "#totalTimeCompletedField":
            {
                observe: "totalTime",
                eventsOverride: ["blur"],
                onGet: "getTime",
                onSet: "setTime"
            },
            "#totalTimePlannedField":
            {
                observe: "totalTimePlanned",
                eventsOverride: ["blur"],
                onGet: "getTime",
                onSet: "setTime"
            },
            "#tssPlannedField":
            {
                observe: "tssPlanned",
                eventsOverride: ["blur"]
            },
            "#tssCompletedField":
            {
                observe: "tssActual",
                eventsOverride: ["blur"]
            },
            "#normalizedPacePlannedField":
            {
                observe: "normalizedSpeedActual",
                eventsOverride: ["blur"],
                onGet: "getPace",
                onSet: "setPace"
            },
            "#averagePacePlannedField":
            {
                observe: "velocityPlanned",
                eventsOverride: ["blur"],
                onGet: "getPace",
                onSet: "setPace"
            },
            "#averagePaceCompletedField":
            {
                observe: "velocityAverage",
                eventsOverride: ["blur"],
                onGet: "getPace",
                onSet: "setPace"
            },
            "#averageSpeedPlannedField":
            {
                observe: "velocityPlanned",
                eventsOverride: ["blur"],
                onGet: "getSpeed",
                onSet: "setSpeed"
            },
            "#averageSpeedCompletedField":
            {
                observe: "velocityAverage",
                eventsOverride: ["blur"],
                onGet: "getSpeed",
                onSet: "setSpeed"
            },
            "#caloriesPlannedField":
            {
                observe: "caloriesPlanned",
                eventsOverride: ["blur"]
            },
            "#caloriesCompletedField":
            {
                observe: "calories",
                eventsOverride: ["blur"]
            },
            "#elevationGainPlannedField":
            {
                observe: "elevationGainPlanned",
                eventsOverride: ["blur"],
                onGet: "getElevation",
                onSet: "setElevation"
            },
            "#elevationGainCompletedField":
            {
                observe: "elevationGain",
                eventsOverride: ["blur"],
                onGet: "getElevation",
                onSet: "setElevation"
            },
            "#elevationLossCompletedField":
            {
                observe: "elevationLoss",
                eventsOverride: ["blur"],
                onGet: "getElevation",
                onSet: "setElevation"
            },
            "#ifPlannedField":
            {
                observe: "ifPlanned",
                eventsOverride: ["blur"]
            },
            "#ifCompletedField":
            {
                observe: "if",
                eventsOverride: ["blur"]
            },
            "#energyPlannedField":
            {
                observe: "energyPlanned",
                eventsOverride: ["blur"]
            },
            "#energyCompletedField":
            {
                observe: "energy",
                eventsOverride: ["blur"]
            },
            "#powerAvgField":
            {
                observe: "powerAverage",
                eventsOverride: ["blur"]
            },
            "#powerMaxField":
            {
                observe: "powerMaximum",
                eventsOverride: ["blur"]
            },
            "#torqueAvgField":
            {
                observe: "torqueAverage",
                eventsOverride: ["blur"]
            },
            "#torqueMaxField":
            {
                observe: "torqueMaximum",
                eventsOverride: ["blur"]
            },
            "#elevationMinField":
            {
                observe: "elevationMinimum",
                eventsOverride: ["blur"]
            },
            "#elevationAvgField":
            {
                observe: "elevationAverage",
                eventsOverride: ["blur"]
            },
            "#elevationMaxField":
            {
                observe: "elevationMaximum",
                eventsOverride: ["blur"]
            },
            "#cadenceAvgField":
            {
                observe: "cadenceAverage",
                eventsOverride: ["blur"]
            },
            "#cadenceMaxField":
            {
                observe: "cadenceMaximum",
                eventsOverride: ["blur"]
            },
            "#speedAvgField":
            {
                observe: "velocityAverage",
                eventsOverride: ["blur"]
            },
            "#speedMaxField":
            {
                observe: "velocityMaximum",
                eventsOverride: ["blur"]
            },
            "#paceMinField":
            {
                //TODO Find the right field to observe
                observe: "velocityAverage",
                eventsOverride: ["blur"]
            },
            "#paceAvgField":
            {
                observe: "velocityAverage",
                eventsOverride: ["blur"]
            },
            "#paceMaxField":
            {
                observe: "velocityMaximum",
                eventsOverride: ["blur"]
            },
            "#hrMinField":
            {
                observe: "heartRateMinimum",
                eventsOverride: ["blur"]
            },
            "#hrAvgField":
            {
                observe: "heartRateAverage",
                eventsOverride: ["blur"]
            },
            "#hrMaxField":
            {
                observe: "heartRateMaximum",
                eventsOverride: ["blur"]
            },
            "#tempMinField":
            {
                observe: "tempMin",
                eventsOverride: ["blur"]
            },
            "#tempAvgField":
            {
                observe: "tempAvg",
                eventsOverride: ["blur"]
            },
            "#tempMaxField":
            {
                observe: "tempMax",
                eventsOverride: ["blur"]
            },
            "#descriptionInput":
            {
                observe: "description",
                eventsOverride: ["blur"]
            },
            "#startTimeInput":
            {
                observe: "startTime",
                eventsOverride: ["changeTime"],
                onGet: "getStartTime",
                onSet: "setStartTime"
            }
        }
    });
});
