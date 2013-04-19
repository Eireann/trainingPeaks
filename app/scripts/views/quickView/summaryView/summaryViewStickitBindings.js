define(
[
    "utilities/printUnitLabel",
    "utilities/printTimeFromDecimalHours",
    "utilities/conversion"
],
function(
    printUnitLabel,
    printTimeFromDecimalHours,
    conversion
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
                onGet: "getTSS",
                onSet: "setTSS",
                updateModel: "updateModel"
            },
            "#tssCompletedField":
            {
                observe: "tssActual",
                onGet: "getTSS",
                onSet: "setTSS",
                updateModel: "updateModel"
            },
            "#normalizedPaceCompletedField":
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
                onGet: "getIF",
                onSet: "setIF",
                updateModel: "updateModel"
            },
            "#ifCompletedField":
            {
                observe: "if",
                onGet: "getIF",
                onSet: "setIF",
                updateModel: "updateModel"
            },
            "#energyPlannedField":
            {
                observe: "energyPlanned",
                onGet: "getEnergy",
                onSet: "setEnergy",
                updateModel: "updateModel"
            },
            "#energyCompletedField":
            {
                observe: "energy",
                onGet: "getEnergy",
                onSet: "setEnergy",
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
                events: [ "blur", "keyup", "change", "cut", "paste" ],
                observe: "description",
                updateModel: "updateModel"
            },
            "#postActivityCommentsInput":
            {
                observe: "newComment",
                onSet: "setTextField",
                events: ["blur", "change"]
            },
            "#preActivityCommentsInput": 
            {
                observe: "coachComments",
                onSet: "setTextField",
                events: ["blur", "change"]
            }
        },

        getDistance: function(value, options)
        {
            return conversion.convertToViewUnits(value, "distance");
        },

        setDistance: function(value, options)
        {
            return conversion.convertToModelUnits(parseFloat(value), "distance");
        },

        getTime: function (value, options)
        {
            return printTimeFromDecimalHours(value, true, "");
        },

        setTime: function (value, options)
        {
            return conversion.convertTimeHoursToDecimal(value);
        },

        getPace: function (value, options)
        {
            return conversion.convertToViewUnits(value, "pace");
        },

        setPace: function (value, options)
        {
            return conversion.convertToModelUnits(value, "pace");
        },

        getSpeed: function (value, options)
        {
            return conversion.convertToViewUnits(value, "speed");
        },

        setSpeed: function (value, options)
        {
            return conversion.convertToModelUnits(parseFloat(value), "speed");
        },

        getElevation: function (value, options)
        {
            return conversion.convertToViewUnits(value, "elevation");
        },

        setElevation: function (value, options)
        {
            return conversion.convertToModelUnits(parseInt(value, 10), "elevation");
        },

        getNumber: function(value, options)
        {
            return ((value === null || value === 0 || value === "0") ? "" : +value);
        },
        
        setInteger: function(value, options)
        {
            return ((value === "" || value === "0") ? null : parseInt(value, 10));
        },
        
        setFloat: function(value, options)
        {
            return (value === "" ? null : parseFloat(value));
        },

        getTemperature: function(value, options)
        {
            return conversion.convertToViewUnits(value, "temperature");
        },
        
        setTemperature: function(value, options)
        {
            return conversion.convertToModelUnits(parseInt(value, 10), "temperature");
        },
        
        getIF: function (value, options)
        {
            return value ? +(Math.round(value * 100) / 100) : "";
        },

        setIF: function (value, options)
        {
            return value ? (Math.round(parseFloat(value) * 100) / 100).toFixed(2) : 0;
        },
        
        getTSS: function (value, options)
        {
            return value ? (Math.round(value * 10) / 10) : "";
        },

        setTSS: function (value, options)
        {
            return value ? (Math.round(parseFloat(value) * 10) / 10).toFixed(1) : 0;
        },
        
        getEnergy: function (value, options)
        {
            return value ? +(Math.round(value)) : "";
        },

        setEnergy: function (value, options)
        {
            return value ? (Math.round(parseFloat(value))).toFixed(0) : 0;
        },


        setTextField: function(value, options)
        {
            return value === "" ? null : value;
        },

        updateModel: function(newViewValue, options)
        {
            var self = this;

            var updateModel = function()
            {
                if (self.checkIfModelUpdateRequired(newViewValue, options))
                    self.performModelUpdate(newViewValue, options);
            };
            
            if (this.updateModelTimeout)
                clearTimeout(this.updateModelTimeout);

            // TODO: This required a hack at line ~100 of the Backbone.StickIt library in order to work
            // properly. There does not seem to be any other way to catch which type of event triggered
            // this update request.
            if (options.eventType === "blur")
                updateModel();
            else
                this.updateModelTimeout = setTimeout(updateModel, 2000);

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
            else
                doUpdateModel = (this[options.onGet](currentModelValue) == newViewValue) ? false : true;
            /*jsline eqeq: false*/

            return doUpdateModel;
        },
        
        performModelUpdate: function(newViewValue, options)
        {
            // Do the save!
            var newModelValue = options.observe === "description" ? newViewValue : this[options.onSet](newViewValue);
            this.model.set(options.observe, newModelValue);
            this.model.save();
        }
    };

    return summaryViewStickitBindings;
});
