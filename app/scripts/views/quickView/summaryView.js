define(
[
    "jqueryTextAreaResize",
    "underscore",
    "moment",
    "TP",
    "setImmediate",
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
    setImmediate,
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

            var self = this;
            this.$("textarea").autosize();
            this.applyUICustomization();

            setImmediate(function () { self.setTextArea(); });

            if (!this.stickitInitialized)
            {
                this.model.off("change", this.render);

                // there is no saveWorkout method ...
                //this.model.on("change", this.saveWorkout, this);

                this.stickit();
                this.stickitInitialized = true;
            }
        },

        setTextArea: function()
        {
            if (this.$("#descriptionInput").val())
            {
                this.$("#descriptionInput").height(this.$("#descriptionInput")[0].scrollHeight);
            }

            if (this.$("#preActivityCommentsInput").val())
            {
                this.$("#preActivityCommentsInput").height(this.$("#preActivityCommentsInput")[0].scrollHeight);
            }

            if (this.$("#descriptionInput").val())
            {
                this.$("#postActivityCommentsInput").height(this.$("#postActivityCommentsInput")[0].scrollHeight);
            }
        },

        applyUICustomization: function ()
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

            //var userWorkoutSettings = theMarsApp.user.get("settings").workout;
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
