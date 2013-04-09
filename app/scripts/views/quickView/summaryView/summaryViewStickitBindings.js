define(
[
    "utilities/printUnitLabel",
    "utilities/convertToViewUnits",
    "utilities/printTimeFromDecimalHours",
    "utilities/conversion",
    "hbs!templates/views/quickView/workoutComments"
],
function(
    printUnitLabel,
    convertToViewUnits,
    printTimeFromDecimalHours,
    conversion,
    workoutCommentsTemplate
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
                observe: "tssPlanned"
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
                observe: "caloriesPlanned"
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
            },
            "#postActivityCommentsInput": 
            {
                observe: "newComment"
            },
            "#postActivityCommentsList":
            {
                observe: "workoutComments",
                onGet: "getFormattedWorkoutComments",
                updateMethod: "html"
            }
        },

        getDistance: function (value, options)
        {
            return +convertToViewUnits(value, "distance", null, null, 2);
        },

        setDistance: function(value, options)
        {
            return conversion.convertToModelUnits(parseFloat(value), "distance");
        },

        getTime: function (value, options)
        {
            return printTimeFromDecimalHours(value, true);
        },

        setTime: function (value, options)
        {
            return conversion.convertTimeHoursToDecimal(value);
        },

        getPace: function (value, options)
        {
            return convertToViewUnits(value, "pace");
        },

        setPace: function (value, options)
        {
            return conversion.convertToModelUnits(value, "pace");
        },

        getSpeed: function (value, options)
        {
            return +convertToViewUnits(value, "speed");
        },

        setSpeed: function (value, options)
        {
            return conversion.convertToModelUnits(parseFloat(value), "speed");
        },

        getElevation: function (value, options)
        {
            return +convertToViewUnits(value, "elevation");
        },

        setElevation: function (value, options)
        {
            return conversion.convertToModelUnits(parseInt(value, 10), "elevation");
        },

        getNumber: function(value, options)
        {
            return ((value === null || value === 0) ? "" : +value);
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
            return +convertToViewUnits(value, "temperature");
        },
        
        setTemperature: function(value, options)
        {
            return conversion.convertToModelUnits(parseInt(value, 10), "temperature");
        },

        getFormattedWorkoutComments: function(value, options)
        {
            var commentsHTML = workoutCommentsTemplate({ workoutComments: value });
            return commentsHTML;
        },

        updateModel: function(newViewValue, options)
        {
            var currentModelValue = this.model.get(options.observe);
            var currentViewValue = this[options.onGet](currentModelValue);

            // DO coerce type in this situation, since we only care about truthy/falsy'ness.
            /*jslint eqeq: true*/
            var doUpdateModel = (currentViewValue == newViewValue) ? false : true;
            /*jsline eqeq: false*/

            if (doUpdateModel)
            {
                var self = this;
                var $input = this.$(this.bindingsLUT[options.observe]);
                var $overlay = $("<div>updating...</div>").width($input.width()).height($input.height()).offset($input.offset());
                $("body").append($overlay);
                
                //Add progress overlay
                
                
                // Do the save!
                var newModelValue = this[options.onSet](newViewValue);
                this.model.set(options.observe, newModelValue);
                var modelUpdatePromise = this.model.save();

                modelUpdatePromise.done(function()
                {
                    //Add success overlay
                    $overlay.html("success!");
                    
                    setTimeout(function()
                    {
                        //Remove success overlay
                        $overlay.remove();
                        
                    }, 5000);
                });
            }

            return false;
        }

    };

    return summaryViewStickitBindings;
});
