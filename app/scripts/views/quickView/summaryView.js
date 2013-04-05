define(
[
    "jquerySelectBox",
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
    "hbs!templates/views/quickView/summaryView"
],
function (
    selectBox,
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
        
        initialize: function ()
        {
            this.model.on("change:workoutDay change:workoutTypeValueId", this.updateUICustomization, this);
        },
        
        onRender: function()
        {

            var self = this;
            this.$("textarea").autosize();
            this.applyUICustomization();

            if (!this.renderInitialized)
            {
                this.model.off("change", this.render);

                // do this before stickit or we lose our bindings ...
                this.applyUICustomization();
                this.setTextAreaHeight();

                // now set stickit bindings
                this.stickit();
                this.renderInitialized = true;

            }

            this.$("textarea").autosize();
            setImmediate(function() { self.setTextAreaHeight(); });
        },

        updateUICustomization: function()
        {
            this.unstickit();
            this.applyUICustomization();
            this.stickit();
        },

        setTextAreaHeight: function()
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

            //this.$(".chosenSelect").chosen();
        },

        applyUICustomization: function()
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
            } else
            {
                this.$(".workoutStatsCompleted input").attr("disabled", false);
                this.$("#workoutMinMaxAvgStats input").attr("disabled", false);
                //apply ghost css attribute
                //this all needs refactored
                this.$("label.workoutStatsCompleted").removeClass("ghosted");
                this.$(".columnLabelsMinMaxAvg label").removeClass("ghosted");
                this.$("#workoutMinMaxAvgStats label").removeClass("ghosted");
                this.$("#workoutMinMaxAvgStats").removeClass("ghosted");
            }
        },

        applyUserPreferences: function()
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

            //Reset visibility
            statsTree.find(".workoutStatsRow").each(function() { $(this).addClass('hide'); });
            summaryTree.find(".workoutStatsRow").each(function() { $(this).addClass('hide'); });

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
                var summaryRowCount = 0;
                if (summaryRow !== [])
                {
                    summaryRow.insertBefore(summaryAnchor);
                    summaryRow.removeClass("hide");
                    summaryRowCount++;
                }

                if (summaryRowCount === 0)
                    this.$(".columnLabelsMinMaxAvg").addClass("hide");
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
            return convertToViewUnits(value, "distance", null, null, 2);
        },

        setDistance: function(value, options)
        {
            return convertToModelUnits(value, "distance");
        },

        getTime: function (value, options)
        {
            return printTimeFromDecimalHours(value, true);
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
                onGet: "getDistance",
                onSet: "setDistance"
            },
            "#distancePlannedField":
            {
                observe: "distancePlanned",
                onGet: "getDistance",
                onSet: "setDistance"
            },
            "#totalTimeCompletedField":
            {
                observe: "totalTime",
                onGet: "getTime",
                onSet: "setTime"
            },
            "#totalTimePlannedField":
            {
                observe: "totalTimePlanned",
                onGet: "getTime",
                onSet: "setTime"
            },
            "#tssPlannedField":
            {
                observe: "tssPlanned"
            },
            "#tssCompletedField":
            {
                observe: "tssActual"
            },
            "#normalizedPacePlannedField":
            {
                observe: "normalizedSpeedActual",
                onGet: "getPace",
                onSet: "setPace"
            },
            "#averagePacePlannedField":
            {
                observe: "velocityPlanned",
                onGet: "getPace",
                onSet: "setPace"
            },
            "#averagePaceCompletedField":
            {
                observe: "velocityAverage",
                onGet: "getPace",
                onSet: "setPace"
            },
            "#averageSpeedPlannedField":
            {
                observe: "velocityPlanned",
                onGet: "getSpeed",
                onSet: "setSpeed"
            },
            "#averageSpeedCompletedField":
            {
                observe: "velocityAverage",
                onGet: "getSpeed",
                onSet: "setSpeed"
            },
            "#caloriesPlannedField":
            {
                observe: "caloriesPlanned"
            },
            "#caloriesCompletedField":
            {
                observe: "calories"
            },
            "#elevationGainPlannedField":
            {
                observe: "elevationGainPlanned",
                onGet: "getElevation",
                onSet: "setElevation"
            },
            "#elevationGainCompletedField":
            {
                observe: "elevationGain",
                onGet: "getElevation",
                onSet: "setElevation"
            },
            "#elevationLossCompletedField":
            {
                observe: "elevationLoss",
                onGet: "getElevation",
                onSet: "setElevation"
            },

            "#ifPlannedField": "ifPlanned",

            "#ifCompletedField": "if",

            "#energyPlannedField": "energyPlanned",

            "#energyCompletedField": "energy",

            "#powerAvgField": "powerAverage",

            "#powerMaxField": "powerMaximum",

            "#torqueAvgField": "torqueAverage",

            "#torqueMaxField": "torqueMaximum",

            "#elevationMinField": "elevationMinumum",

            "#elevationAvgField": "elevationAverage",
            "#elevationMaxField": "elevationMaximum",
            "#cadenceAvgField": "cadenceAverage",
            "#cadenceMaxField": "cadenceMaximum",
            "#speedAvgField": "velocityAverage",
            "#speedMaxField": "velocityMaximum",
            "#paceMinField": "velocityAverage",
            "#paceAvgField": "velocityAverage",
            "#paceMaxField": "velocityMaximum",
            "#hrMinField": "heartRateMinimum",
            "#hrAvgField": "heartRateAverage",
            "#hrMaxField": "heartRateMaximum",
            "#tempMinField": "tempMin",
            "#tempAvgField": "tempAvg",
            "#tempMaxField": "tempMax",
            "#descriptionInput": "description",
            "#postActivityCommentsInput": "newComment"
        }
    });
});
