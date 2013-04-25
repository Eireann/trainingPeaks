define(
[
    "underscore",
    "TP"
],
function(
    _,
    TP
)
{
    var summaryViewStickitBindings = {

        initializeStickit: function()
        {
            this.bindingsLUT = {};
            
            _.each(this.bindings, function(value, key)
            {
                this.bindingsLUT[value.observe] = key;
            }, this);

            this.on("close", this.stickitBindingsOnClose, this);
            this.on("render", this.stickitBindingsOnRender, this);

            this.fixNewlinesOnModelDescription();
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
            "#averagePacePlannedField":
            {
                observe: "velocityPlanned",
                onGet: "formatPace",
                onSet: "parsePace",
                updateModel: "updateModel"
            },
            "#averagePaceCompletedField":
            {
                observe: "velocityAverage",
                onGet: "formatPace",
                onSet: "parsePace",
                updateModel: "updateModel"
            },
            "#averageSpeedPlannedField":
            {
                observe: "velocityPlanned",
                onGet: "formatSpeed",
                onSet: "parseSpeed",
                updateModel: "updateModel"
            },
            "#averageSpeedCompletedField":
            {
                observe: "velocityAverage",
                onGet: "formatSpeed",
                onSet: "parseSpeed",
                updateModel: "updateModel"
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
                onGet: "formatNumber",
                onSet: "parseFloat",
                updateModel: "updateModel"
            },
            "#powerMaxField":
            {
                observe: "powerMaximum",
                onGet: "formatNumber",
                onSet: "parseFloat",
                updateModel: "updateModel"
            },
            "#torqueAvgField":
            {
                observe: "torqueAverage",
                onGet: "formatNumber",
                onSet: "parseFloat",
                updateModel: "updateModel"
            },
            "#torqueMaxField":
            {
                observe: "torqueMaximum",
                onGet: "formatNumber",
                onSet: "parseFloat",
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
                updateModel: "updateModel"
            },
            "#speedMaxField":
            {
                observe: "velocityMaximum",
                onGet: "formatSpeed",
                onSet: "parseSpeed",
                updateModel: "updateModel"
            },
            "#paceAvgField":
            {
                observe: "velocityAverage",
                onGet: "formatPace",
                onSet: "parsePace",
                updateModel: "updateModel"
            },
            "#paceMaxField":
            {
                observe: "velocityMaximum",
                onGet: "formatPace",
                onSet: "parsePace",
                updateModel: "updateModel"
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
                updateModel: "updateModel"
            },
            "#postActivityCommentsInput":
            {
                observe: "newComment",
                onSet: "parseTextField",
                onGet: "formatTextField",
                events: ["blur", "change", "keyup", "paste"],
                updateModel: "updateModel"
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
            var newValue = value.replace(/\r\n/g, "\n").replace(/\n/g, "\r\n");
            return newValue;
        },

        updateModel: function(newViewValue, options)
        {
            var self = this;
            var saveTimeout = options.observe === "newComment" ? 60000 : 2000;

            var updateModel = function()
            {
                var inputFieldId = self.bindingsLUT[options.observe];
                var currentViewValue = self.$(inputFieldId).val();
                if (self.checkIfModelUpdateRequired(currentViewValue, options))
                    self.performModelUpdate(currentViewValue, options);
            };

            if (this.updateModelTimeout)
                clearTimeout(this.updateModelTimeout);

            // TODO: This required a hack at line ~100 of the Backbone.StickIt library in order to work
            // properly. There does not seem to be any other way to catch which type of event triggered
            // this update request.
            if (options.eventType === "blur")
                updateModel();
            else
                this.updateModelTimeout = setTimeout(updateModel, saveTimeout);

            return false;
        },

        checkIfModelUpdateRequired: function(newViewValue, options)
        {
            var doUpdateModel;
            var currentModelValue = this.model.get(options.observe);

            // DO coerce type in this situation, since we only care about truthy/falsy'ness.
            /*jslint eqeq: true*/
            if (options.observe === "description")
                doUpdateModel = (newViewValue === "" && currentModelValue === null ? false : (newViewValue != currentModelValue));
            else if (!options.onGet)
                doUpdateModel = currentModelValue == newViewValue ? false : true;
            else
                doUpdateModel = (this[options.onGet](currentModelValue) == newViewValue || parseFloat(this[options.onGet](currentModelValue)) == parseFloat(newViewValue)) ? false : true;
            /*jsline eqeq: false*/

            return doUpdateModel;
        },
        
        performModelUpdate: function(newViewValue, options)
        {
            // Do the save!
            var newModelValue = options.observe === "description" ? newViewValue : this[options.onSet](newViewValue);
            this.model.set(options.observe, newModelValue);

            if (options.observe === "distance" || options.observe === "totalTime")
                this.model.set("velocityAverage", null);
            else if (options.observe === "distancePlanned" || options.observe === "totalTimePlanned")
                this.model.set("velocityPlanned", null);

            this.model.save();
        }

    };

    _.extend(summaryViewStickitBindings, TP.utils.conversion);
    return summaryViewStickitBindings;
});
