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
    var summaryViewStickitBindings = {

        initializeStickit: function()
        {
            this.addModelToBindings();
            this.on("close", this.stickitBindingsOnClose, this);
            this.on("render", this.stickitBindingsOnRender, this);

            this.fixNewlinesOnModelDescription();
            this.on("setModelValue", this.afterSetModelValue, this);
        },

        fixNewlinesOnModelDescription: function()
        {
            // FIXME - we need to handle this on an api level
            this.model.on("change:description", function()
            {
                this.model.set("description",
                    this.fixNewlines(this.model.get("description")),
                    { silent: true });
            }, this);

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
                updateModel: "updateModel",
                precision: 2
            },
            "#distancePlannedField":
            {
                observe: "distancePlanned",
                onGet: "formatDistance",
                onSet: "parseDistance",
                updateModel: "updateModel",
                precision: 2
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
                updateModel: "updateModel",
                defaultValue: ""
            },
            "#tssCompletedField":
            {
                observe: "tssActual",
                onGet: "formatTSS",
                onSet: "parseTSS",
                updateModel: "updateModel",
                defaultValue: ""
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
                onGet: "formatInteger",
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
                onGet: "formatNumber",
                onSet: "parseInteger",
                updateModel: "updateModel"
            },
            "#caloriesCompletedField":
            {
                observe: "calories",
                onGet: "formatNumber",
                onSet: "parseInteger",
                updateModel: "updateModel"
            },
            "#elevationGainPlannedField":
            {
                observe: "elevationGainPlanned",
                onGet: "formatElevation",
                onSet: "parseElevation",
                updateModel: "updateModel"
            },
            "#elevationGainCompletedField":
            {
                observe: "elevationGain",
                onGet: "formatElevation",
                onSet: "parseElevation",
                updateModel: "updateModel"
            },
            "#elevationLossCompletedField":
            {
                observe: "elevationLoss",
                onGet: "formatElevation",
                onSet: "parseElevation",
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
                onGet: "formatInteger",
                onSet: "parseFloat",
                updateModel: "updateModel"
            },
            "#powerMaxField":
            {
                observe: "powerMaximum",
                onGet: "formatInteger",
                onSet: "parseFloat",
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
                onGet: "formatNumber",
                onSet: "parseInteger",
                updateModel: "updateModel"
            },
            "#cadenceMaxField":
            {
                observe: "cadenceMaximum",
                onGet: "formatNumber",
                onSet: "parseInteger",
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
                onGet: "formatNumber",
                onSet: "parseInteger",
                updateModel: "updateModel"
            },
            "#hrAvgField":
            {
                observe: "heartRateAverage",
                onGet: "formatNumber",
                onSet: "parseInteger",
                updateModel: "updateModel"
            },
            "#hrMaxField":
            {
                observe: "heartRateMaximum",
                onGet: "formatNumber",
                onSet: "parseInteger",
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
            "#descriptionInput":
            {
                events: [ "blur", "keyup", "change", "cut", "paste" ],
                observe: "description",
                onSet: "parseTextField",
                onGet: "formatTextField",
                updateModel: "updateModel",
                ignoreOnSetForUpdateModel: true
            },
            "#postActivityCommentsInput":
            {
                observe: "newComment",
                onSet: "parseTextField",
                onGet: "formatTextField",
                events: ["blur", "change", "keyup", "paste"],
                updateModel: "updateModel",
                saveTimeout: 60000
            },
            "#preActivityCommentsInput": 
            {
                observe: "coachComments",
                onSet: "parseTextField",
                onGet: "formatTextField",
                events: ["blur", "change", "keyup", "paste"],
                updateModel: "updateModel"
            }
        },

        parseTextField: function(value, options)
        {
            return value === "" ? null : this.fixNewlines(value);
        },

        formatTextField: function(value, options)
        {
            return value === null ? "" : this.fixNewlines(value);
        },

        fixNewlines: function(value)
        {
            if (value === null)
                return "";

            var newValue = value.replace(/\r\n/g, "\n").replace(/\n/g, "\r\n");
            return newValue;
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
        }
    };

    _.extend(summaryViewStickitBindings, stickitUtilsMixin);
    return summaryViewStickitBindings;
});
