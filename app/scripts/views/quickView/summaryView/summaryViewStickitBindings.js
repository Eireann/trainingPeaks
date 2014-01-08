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
            this.addDefaultHandlersToBindings();
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
                units: "distance"
            },
            "#distancePlannedField":
            {
                observe: "distancePlanned",
                units: "distance"
            },
            "#totalTimeCompletedField":
            {
                observe: "totalTime",
                units: "duration"
            },
            "#totalTimePlannedField":
            {
                observe: "totalTimePlanned",
                units: "duration"
            },
            "#tssPlannedField":
            {
                observe: "tssPlanned",
                units: "tss"
            },
            "#tssCompletedField":
            {
                observe: "tssActual",
                units: "tss"
            },
            "#normalizedPaceCompletedField":
            {
                observe: "normalizedSpeedActual",
                units: "pace"
            },
            "#normalizedPowerCompleted":
            {
                observe: "normalizedPowerActual",
                units: "power"
            },
            "#averagePacePlannedField":
            {
                observe: "velocityPlanned",
                units: "pace",

                // NOTE: For any pace/speed fields that share the same velocityXXX model field,
                // we need input id here for updateModel to work right, 
                // but we don't need it for other fields because we can get it from bindingsLUT
                inputId: "#averagePacePlannedField"
            },
            "#averagePaceCompletedField":
            {
                observe: "velocityAverage",
                units: "pace",
                inputId: "#averagePaceCompletedField"
            },
            "#averageSpeedPlannedField":
            {
                observe: "velocityPlanned",
                units: "speed",
                inputId: "#averageSpeedPlannedField"
            },
            "#averageSpeedCompletedField":
            {
                observe: "velocityAverage",
                units: "speed",
                inputId: "#averageSpeedCompletedField"
            },
            "#caloriesPlannedField":
            {
                observe: "caloriesPlanned",
                units: "calories"
            },
            "#caloriesCompletedField":
            {
                observe: "calories",
                units: "calories"
            },
            "#elevationGainPlannedField":
            {
                observe: "elevationGainPlanned",
                units: "elevationGain"
            },
            "#elevationGainCompletedField":
            {
                observe: "elevationGain",
                units: "elevationGain"
            },
            "#elevationLossCompletedField":
            {
                observe: "elevationLoss",
                units: "elevationLoss"
            },
            "#ifPlannedField":
            {
                observe: "ifPlanned",
                units: "if"
            },
            "#ifCompletedField":
            {
                observe: "if",
                units: "if"
            },
            "#energyPlannedField":
            {
                observe: "energyPlanned",
                units: "energy"
            },
            "#energyCompletedField":
            {
                observe: "energy",
                units: "energy"
            },
            "#powerAvgField":
            {
                observe: "powerAverage",
                units: "power"
            },
            "#powerMaxField":
            {
                observe: "powerMaximum",
                units: "power"
            },
            "#torqueAvgField":
            {
                observe: "torqueAverage",
                units: "torque"
            },
            "#torqueMaxField":
            {
                observe: "torqueMaximum",
                units: "torque"
            },
            "#elevationMinField":
            {
                observe: "elevationMinimum",
                units: "elevation"
            },
            "#elevationAvgField":
            {
                observe: "elevationAverage",
                units: "elevation"
            },
            "#elevationMaxField":
            {
                observe: "elevationMaximum",
                units: "elevation"
            },
            "#cadenceAvgField":
            {
                observe: "cadenceAverage",
                units: "cadence"
            },
            "#cadenceMaxField":
            {
                observe: "cadenceMaximum",
                units: "cadence"
            },
            "#speedAvgField":
            {
                observe: "velocityAverage",
                units: "speed",
                inputId: "#speedAvgField"
            },
            "#speedMaxField":
            {
                observe: "velocityMaximum",
                units: "speed",
                inputId: "#speedMaxField"
            },
            "#paceAvgField":
            {
                observe: "velocityAverage",
                units: "pace",
                inputId: "#paceAvgField"
            },
            "#paceMaxField":
            {
                observe: "velocityMaximum",
                units: "pace",
                inputId: "#paceMaxField"
            },
            "#hrMinField":
            {
                observe: "heartRateMinimum",
                units: "heartrate" 
            },
            "#hrAvgField":
            {
                observe: "heartRateAverage",
                units: "heartrate"
            },
            "#hrMaxField":
            {
                observe: "heartRateMaximum",
                units: "heartrate"
            },
            "#tempMinField":
            {
                observe: "tempMin",
                units: "temperature"
            },
            "#tempAvgField":
            {
                observe: "tempAvg",
                units: "temperature"
            },
            "#tempMaxField":
            {
                observe: "tempMax",
                units: "temperature"
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
        },

        addDefaultHandlersToBindings: function()
        {
            _.eah(this.bindings, function(binding)
            {
                if(!binding.onGet)
                {
                    binding.onGet = "defaultOnGet";
                }

                if(!binding.onSet)
                {
                    binding.onSet = "defaultOnSet";
                }

                if(!binding.updateModel)
                {
                    binding.updateModel = "updateModel";
                }

            }, this);
        },

        defaultOnGet: function(value, options)
        {
            return this.formatUnitsValue(options.units, value, options);
        },

        defaultOnSet: function(value, options)
        {
            return this.parseUnitsValue(options.units, value, options);
        }

    };

    _.extend(summaryViewStickitBindings, stickitUtilsMixin);
    return summaryViewStickitBindings;
});
