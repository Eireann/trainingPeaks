define(
[
    "underscore",
    "TP",
    "utilities/stickitMixin"
],
function(
    _,
    TP,
    stickitUtilsMixin
)
{
    var summaryViewStickitBindings =
    {
        initializeStickit: function()
        {
            this.addModelToBindings();
            this.on("close", this.stickitBindingsOnClose, this);
            this.on("render", this.stickitBindingsOnRender, this);
            this.on("setModelValue", this.afterSetModelValue, this);
        },

        stickitBindingsOnClose: function()
        {
            this.unstickit();
        },

        stickitBindingsOnRender: function()
        {
            if (!this.stickitBindingsInitialized)
            {
                this.model.off("change", this.render);
                this.stickit();
                this.stickitBindingsInitialized = true;
            }
        },

        bindings:
        {
            "#distanceCompletedField":
            {
                observe: "distance",
                onGet: "formatDistance",
                onSet: "parseDistance",
                updateModel: "updateModel"
            },
            "#distancePlannedField":
            {
                observe: "distancePlanned",
                onGet: "formatDistance",
                onSet: "parseDistance",
                updateModel: "updateModel"
            },
            "#totalTimeCompletedField":
            {
                observe: "totalTime",
                onGet: "formatDuration",
                onSet: "parseDuration",
                updateModel: "updateModel"
            },
            "#totalTimePlannedField":
            {
                observe: "totalTimePlanned",
                onGet: "formatDuration",
                onSet: "parseDuration",
                updateModel: "updateModel"
            },
            "#tssPlannedField":
            {
                observe: "tssPlanned",
                onGet: "formatTSS",
                onSet: "parseTSS",
                updateModel: "updateModel"
            },
            "#tssCompletedField":
            {
                observe: "tssActual",
                onGet: "formatTSS",
                onSet: "parseTSS",
                updateModel: "updateModel"
            },
            "#normalizedPaceCompletedField":
            {
                observe: "normalizedSpeedActual",
                onGet: "formatPace",
                onSet: "parsePace",
                updateModel: "updateModel"
            },
            "#normalizedPowerCompleted":
            {
                observe: "normalizedPowerActual",
                onGet: "formatPower",
                onSet: "parsePower",
                updateModel: "updateModel"
            },
            "#averagePacePlannedField":
            {
                observe: "velocityPlanned",
                onGet: "formatPace",
                onSet: "parsePace",
                updateModel: "updateModel",

                // NOTE: For any pace/speed fields that share the same velocityXXX model field,
                // we need input id here for updateModel to work right, 
                // but we don't need it for other fields because we can get it from bindingsLUT
                inputId: "#averagePacePlannedField"
            },
            "#averagePaceCompletedField":
            {
                observe: "velocityAverage",
                onGet: "formatPace",
                onSet: "parsePace",
                updateModel: "updateModel",
                inputId: "#averagePaceCompletedField"
            },
            "#averageSpeedPlannedField":
            {
                observe: "velocityPlanned",
                onGet: "formatSpeed",
                onSet: "parseSpeed",
                updateModel: "updateModel",
                inputId: "#averageSpeedPlannedField"
            },
            "#averageSpeedCompletedField":
            {
                observe: "velocityAverage",
                onGet: "formatSpeed",
                onSet: "parseSpeed",
                updateModel: "updateModel",
                inputId: "#averageSpeedCompletedField"
            },
            "#caloriesPlannedField":
            {
                observe: "caloriesPlanned",
                onGet: "formatCalories",
                onSet: "parseCalories",
                updateModel: "updateModel"
            },
            "#caloriesCompletedField":
            {
                observe: "calories",
                onGet: "formatCalories",
                onSet: "parseCalories",
                updateModel: "updateModel"
            },
            "#elevationGainPlannedField":
            {
                observe: "elevationGainPlanned",
                onGet: "formatElevationGain",
                onSet: "parseElevationGain",
                updateModel: "updateModel"
            },
            "#elevationGainCompletedField":
            {
                observe: "elevationGain",
                onGet: "formatElevationGain",
                onSet: "parseElevationGain",
                updateModel: "updateModel"
            },
            "#elevationLossCompletedField":
            {
                observe: "elevationLoss",
                onGet: "formatElevationLoss",
                onSet: "parseElevationLoss",
                updateModel: "updateModel"
            },
            "#ifPlannedField":
            {
                observe: "ifPlanned",
                onGet: "formatIF",
                onSet: "parseIF",
                updateModel: "updateModel"
            },
            "#ifCompletedField":
            {
                observe: "if",
                onGet: "formatIF",
                onSet: "parseIF",
                updateModel: "updateModel"
            },
            "#energyPlannedField":
            {
                observe: "energyPlanned",
                onGet: "formatEnergy",
                onSet: "parseEnergy",
                updateModel: "updateModel"
            },
            "#energyCompletedField":
            {
                observe: "energy",
                onGet: "formatEnergy",
                onSet: "parseEnergy",
                updateModel: "updateModel"
            },
            "#powerAvgField":
            {
                observe: "powerAverage",
                onGet: "formatPower",
                onSet: "parsePower",
                updateModel: "updateModel"
            },
            "#powerMaxField":
            {
                observe: "powerMaximum",
                onGet: "formatPower",
                onSet: "parsePower",
                updateModel: "updateModel"
            },
            "#torqueAvgField":
            {
                observe: "torqueAverage",
                onGet: "formatTorque",
                onSet: "parseTorque",
                updateModel: "updateModel"
            },
            "#torqueMaxField":
            {
                observe: "torqueMaximum",
                onGet: "formatTorque",
                onSet: "parseTorque",
                updateModel: "updateModel"
            },
            "#elevationMinField":
            {
                observe: "elevationMinimum",
                onGet: "formatElevation",
                onSet: "parseElevation",
                updateModel: "updateModel"
            },
            "#elevationAvgField":
            {
                observe: "elevationAverage",
                onGet: "formatElevation",
                onSet: "parseElevation",
                updateModel: "updateModel"
            },
            "#elevationMaxField":
            {
                observe: "elevationMaximum",
                onGet: "formatElevation",
                onSet: "parseElevation",
                updateModel: "updateModel"
            },
            "#cadenceAvgField":
            {
                observe: "cadenceAverage",
                onGet: "formatCadence",
                onSet: "parseCadence",
                updateModel: "updateModel"
            },
            "#cadenceMaxField":
            {
                observe: "cadenceMaximum",
                onGet: "formatCadence",
                onSet: "parseCadence",
                updateModel: "updateModel"
            },
            "#speedAvgField":
            {
                observe: "velocityAverage",
                onGet: "formatSpeed",
                onSet: "parseSpeed",
                updateModel: "updateModel",
                inputId: "#speedAvgField"
            },
            "#speedMaxField":
            {
                observe: "velocityMaximum",
                onGet: "formatSpeed",
                onSet: "parseSpeed",
                updateModel: "updateModel",
                inputId: "#speedMaxField"
            },
            "#paceAvgField":
            {
                observe: "velocityAverage",
                onGet: "formatPace",
                onSet: "parsePace",
                updateModel: "updateModel",
                inputId: "#paceAvgField"
            },
            "#paceMaxField":
            {
                observe: "velocityMaximum",
                onGet: "formatPace",
                onSet: "parsePace",
                updateModel: "updateModel",
                inputId: "#paceMaxField"
            },
            "#hrMinField":
            {
                observe: "heartRateMinimum",
                onGet: "formatHeartRate",
                onSet: "parseHeartRate",
                updateModel: "updateModel"
            },
            "#hrAvgField":
            {
                observe: "heartRateAverage",
                onGet: "formatHeartRate",
                onSet: "parseHeartRate",
                updateModel: "updateModel"
            },
            "#hrMaxField":
            {
                observe: "heartRateMaximum",
                onGet: "formatHeartRate",
                onSet: "parseHeartRate",
                updateModel: "updateModel"
            },
            "#tempMinField":
            {
                observe: "tempMin",
                onGet: "formatTemperature",
                onSet: "parseTemperature",
                updateModel: "updateModel"
            },
            "#tempAvgField":
            {
                observe: "tempAvg",
                onGet: "formatTemperature",
                onSet: "parseTemperature",
                updateModel: "updateModel"
            },
            "#tempMaxField":
            {
                observe: "tempMax",
                onGet: "formatTemperature",
                onSet: "parseTemperature",
                updateModel: "updateModel"
            },
            "label.pace":
            {
                observe: "workoutTypeValueId",
                onGet: "formatPaceLabel"
            },
            "label.speed":
            {
                observe: "workoutTypeValueId",
                onGet: "formatSpeedLabel"
            },
            "label.distance":
            {
                observe: "workoutTypeValueId",
                onGet: "formatDistanceLabel"
            },
            "label.tss":
            {
                observe: "tssSource",
                onGet: "formatTssLabel"
            }
        },

        afterSetModelValue: function(newViewValue, options)
        {
            if (options.observe === "distance" || options.observe === "totalTime")
                this.model.set("velocityAverage", null);
            else if (options.observe === "distancePlanned" || options.observe === "totalTimePlanned")
                this.model.set("velocityPlanned", null);
        },
        
        addModelToBindings : function()
        {
            _.each(this.bindings, function(binding)
            {
                binding.model = this.model;
            }, this);
        },

        formatPaceLabel: function()
        {
            return TP.utils.units.getUnitsLabel("pace", this.model.get("workoutTypeValueId"), this.model);
        },

        formatSpeedLabel: function()
        {
            return TP.utils.units.getUnitsLabel("speed", this.model.get("workoutTypeValueId"), this.model);
        },

        formatDistanceLabel: function()
        {
            return TP.utils.units.getUnitsLabel("distance", this.model.get("workoutTypeValueId"), this.model);
        },

        formatTssLabel: function()
        {
            return TP.utils.units.getUnitsLabel("tss", this.model.get("workoutTypeValueId"), this.model);
        }

    };

    _.extend(summaryViewStickitBindings, stickitUtilsMixin);
    return summaryViewStickitBindings;
});
