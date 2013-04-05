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
            return +convertToViewUnits(value, "distance", null, null, 2);
        },

        setDistance: function(value, options)
        {
            return convertToModelUnits(parseFloat(value), "distance");
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
            return +convertToViewUnits(value, "speed");
        },

        setSpeed: function (value, options)
        {
            return convertToModelUnits(parseFloat(value), "speed");
        },

        getElevation: function (value, options)
        {
            return +convertToViewUnits(value, "elevation");
        },

        setElevation: function (value, options)
        {
            return convertToModelUnits(parseInt(value, 10), "elevation");
        },

        getNumber: function(value, options)
        {
            
            return (value === null ? "" : +value);
        },
        
        setInteger: function(value, options)
        {
            return (value === "" ? null : parseInt(value, 10));
        },
        
        setFloat: function(value, options)
        {
            return (value === "" ? null : parseFloat(value));
        },
        
        getTemperature: function(value, options)
        {
            return +convertToViewUnits(value, "temperature");
        },
        
        setTemperature: function(value, options)
        {
            return convertToModelUnits(parseInt(value, 10), "temperature");
        },
        
        updateModel: function(val, options)
        {
            console.log("model: " + this.model.get(options.observe));
            console.log("val: " + val);
            return (this.model.get(options.observe) == val) ? false : true;
        },

        bindings:
        {
            "#distanceCompletedField":
            {
                observe: "distance",
                onGet: "getDistance",
                onSet: "setDistance",
                updateModel: "updateModel"
            },
            "#distancePlannedField":
            {
                observe: "distancePlanned",
                onGet: "getDistance",
                onSet: "setDistance",
                updateModel: "updateModel"
            },
            "#totalTimeCompletedField":
            {
                observe: "totalTime",
                onGet: "getTime",
                onSet: "setTime",
                updateModel: "updateModel"
            },
            "#totalTimePlannedField":
            {
                observe: "totalTimePlanned",
                onGet: "getTime",
                onSet: "setTime",
                updateModel: "updateModel"
            },
            "#tssPlannedField":
            {
                observe: "tssPlanned",
                onGet: "getNumber",
                onSet: "setFloat",
                updateModel: "updateModel"
            },
            "#tssCompletedField":
            {
                observe: "tssActual",
                onGet: "getNumber",
                onSet: "setFloat",
                updateModel: "updateModel"
            },
            "#normalizedPacePlannedField":
            {
                observe: "normalizedSpeedActual",
                onGet: "getPace",
                onSet: "setPace",
                updateModel: "updateModel"
            },
            "#averagePacePlannedField":
            {
                observe: "velocityPlanned",
                onGet: "getPace",
                onSet: "setPace",
                updateModel: "updateModel"
            },
            "#averagePaceCompletedField":
            {
                observe: "velocityAverage",
                onGet: "getPace",
                onSet: "setPace",
                updateModel: "updateModel"
            },
            "#averageSpeedPlannedField":
            {
                observe: "velocityPlanned",
                onGet: "getSpeed",
                onSet: "setSpeed",
                updateModel: "updateModel"
            },
            "#averageSpeedCompletedField":
            {
                observe: "velocityAverage",
                onGet: "getSpeed",
                onSet: "setSpeed",
                updateModel: "updateModel"
            },
            "#caloriesPlannedField":
            {
                observe: "caloriesPlanned",
                onGet: "getNumber",
                onSet: "setInteger",
                updateModel: "updateModel"
            },
            "#caloriesCompletedField":
            {
                observe: "calories",
                onGet: "getNumber",
                onSet: "setInteger",
                updateModel: "updateModel"
            },
            "#elevationGainPlannedField":
            {
                observe: "elevationGainPlanned",
                onGet: "getElevation",
                onSet: "setElevation",
                updateModel: "updateModel"
            },
            "#elevationGainCompletedField":
            {
                observe: "elevationGain",
                onGet: "getElevation",
                onSet: "setElevation",
                updateModel: "updateModel"
            },
            "#elevationLossCompletedField":
            {
                observe: "elevationLoss",
                onGet: "getElevation",
                onSet: "setElevation",
                updateModel: "updateModel"
            },
            "#ifPlannedField":
            {
                observe: "ifPlanned",
                onGet: "getNumber",
                onSet: "setInteger",
                updateModel: "updateModel"
            },
            "#ifCompletedField":
            {
                observe: "if",
                onGet: "getNumber",
                onSet: "setFloat",
                updateModel: "updateModel"
            },
            "#energyPlannedField":
            {
                observe: "energyPlanned",
                onGet: "getNumber",
                onSet: "setInteger",
                updateModel: "updateModel"
            },
            "#energyCompletedField":
            {
                observe: "energy",
                onGet: "getNumber",
                onSet: "setInteger",
                updateModel: "updateModel"
            },
            "#powerAvgField":
            {
                observe: "powerAverage",
                onGet: "getNumber",
                onSet: "setFloat",
                updateModel: "updateModel"
            },
            "#powerMaxField":
            {
                observe: "powerMaximum",
                onGet: "getNumber",
                onSet: "setFloat",
                updateModel: "updateModel"
            },
            "#torqueAvgField":
            {
                observe: "torqueAverage",
                onGet: "getNumber",
                onSet: "setFloat",
                updateModel: "updateModel"
            },
            "#torqueMaxField":
            {
                observe: "torqueMaximum",
                onGet: "getNumber",
                onSet: "setFloat",
                updateModel: "updateModel"
            },
            "#elevationMinField":
            {
                observe: "elevationMinimum",
                onGet: "getElevation",
                onSet: "setElevation",
                updateModel: "updateModel"
            },
            "#elevationAvgField":
            {
                observe: "elevationAverage",
                onGet: "getElevation",
                onSet: "setElevation",
                updateModel: "updateModel"
            },
            "#elevationMaxField":
            {
                observe: "elevationMaximum",
                onGet: "getElevation",
                onSet: "setElevation",
                updateModel: "updateModel"
            },
            "#cadenceAvgField":
            {
                observe: "cadenceAverage",
                onGet: "getNumber",
                onSet: "setInteger",
                updateModel: "updateModel"
            },
            "#cadenceMaxField":
            {
                observe: "cadenceMaximum",
                onGet: "getNumber",
                onSet: "setInteger",
                updateModel: "updateModel"
            },
            "#speedAvgField":
            {
                observe: "velocityAverage",
                onGet: "getSpeed",
                onSet: "setSpeed",
                updateModel: "updateModel"
            },
            "#speedMaxField":
            {
                observe: "velocityMaximum",
                onGet: "getSpeed",
                onSet: "setSpeed",
                updateModel: "updateModel"
            },
            "#paceMinField":
            {
                //TODO Find the right field to observe
                observe: "velocityAverage",
                onGet: "getPace",
                onSet: "setPace",
                updateModel: "updateModel"
            },
            "#paceAvgField":
            {
                observe: "velocityAverage",
                onGet: "getPace",
                onSet: "setPace",
                updateModel: "updateModel"
            },
            "#paceMaxField":
            {
                observe: "velocityMaximum",
                onGet: "getPace",
                onSet: "setPace",
                updateModel: "updateModel"
            },
            "#hrMinField":
            {
                observe: "heartRateMinimum",
                onGet: "getNumber",
                onSet: "setInteger",
                updateModel: "updateModel"
            },
            "#hrAvgField":
            {
                observe: "heartRateAverage",
                onGet: "getNumber",
                onSet: "setInteger",
                updateModel: "updateModel"
            },
            "#hrMaxField":
            {
                observe: "heartRateMaximum",
                onGet: "getNumber",
                onSet: "setInteger",
                updateModel: "updateModel"
            },
            "#tempMinField":
            {
                observe: "tempMin",
                onGet: "getTemperature",
                onSet: "setTemperature",
                updateModel: "updateModel"
            },
            "#tempAvgField":
            {
                observe: "tempAvg",
                onGet: "getTemperature",
                onSet: "setTemperature",
                updateModel: "updateModel"
            },
            "#tempMaxField":
            {
                observe: "tempMax",
                onGet: "getTemperature",
                onSet: "setTemperature",
                updateModel: "updateModel"
            },
            "#descriptionInput":
            {
                observe: "description"
            }
        }
    });
});
