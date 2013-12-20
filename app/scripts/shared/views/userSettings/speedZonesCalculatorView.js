define(
[
    "jquery",
    "underscore",
    "setImmediate",
    "TP",
    "shared/data/zoneCalculators",
    "shared/utilities/zoneCalculator",
    "shared/views/userSettings/zoneCalculatorViews",
    "hbs!shared/templates/userSettings/speedZonesCalculatorItemTemplate",
    "hbs!shared/templates/userSettings/paceZonesCalculatorItemTemplate",
    "hbs!shared/templates/userSettings/speedZonesCalculatorTemplate"
],
function(
    $,
    _,
    setImmediate,
    TP,
    ZoneCalculatorDefinitions,
    ZoneCalculator,
    ZoneCalculatorViews,
    speedZoneItemTemplate,
    paceZoneItemTemplate,
    speedZonesCalculatorTemplate
    )
{

    function filterCalculators(calculatorType, workoutTypeId)
    {
        var filteredCalculators = _.filter(ZoneCalculatorDefinitions.speed, function(zoneCalculator) {
            return zoneCalculator.type === calculatorType; 
        });

        if(!_.isUndefined(workoutTypeId))
        {
            filteredCalculators = _.filter(filteredCalculators, function(zoneCalculator) {
                return !zoneCalculator.workoutTypeIds || _.contains(zoneCalculator.workoutTypeIds, workoutTypeId);
            }); 
        }
        return filteredCalculators;
    }

    var SpeedZoneItemView = TP.ItemView.extend({
        className: "zoneCalculatorResult zone", 

        template: {
            type: "handlebars",
            template: function(data) {
                if(data.paceOrSpeed === "speed")
                {
                    return speedZoneItemTemplate(data);
                }
                else
                {
                    return paceZoneItemTemplate(data);
                }
            }
        },

        initialize: function(options)
        {
            this.options = options;
        },

        serializeData: function()
        {
            var data = this.model.toJSON();
            _.extend(data, this.options.serializeData);
            return data;
        }

    });


    var SpeedZoneCalculatorTabView = ZoneCalculatorViews.TabContentView.extend({

        zoneTypesById: ZoneCalculatorDefinitions.speedById,

        zoneCalculator: ZoneCalculator.Speed,

        calculators: _.values(ZoneCalculatorDefinitions.speed),

        units: "speed",

        itemViewOptions: function()
        {
            return {
                serializeData: {
                    paceOrSpeed: this.model.get("paceOrSpeed"),
                    workoutTypeId: this.model.get("workoutTypeId")
                }
            };
        },

        zoneItemView: SpeedZoneItemView,

        template: {
            type: "handlebars",
            template: speedZonesCalculatorTemplate
        },

        initialize: function(options)
        {
            if(options.unitsModel)
            {
                this.unitsModel = options.unitsModel;
            }
            else
            {
                this.unitsModel = new TP.Model({ units: "speed" });
            }
            this.units = this.unitsModel.get("units");
            this.model.set("paceOrSpeed", this.unitsModel.get("units"));
            this.model.set("speedUnits", TP.utils.units.getUnitsLabel("speed", this.model.get("workoutTypeId")));
            this.model.set("paceUnits", TP.utils.units.getUnitsLabel("pace", this.model.get("workoutTypeId")));

            this.unitsModel.on("change:units", this.selectPaceOrSpeed, this);
        },

        selectPaceOrSpeed: function()
        {
            this._applyFormValuesToModel();
            this.model.set("paceOrSpeed", this.unitsModel.get("units")); 
            this.units = this.unitsModel.get("units");
            this._applyModelValuesToForm();
            if(this.collection.length)
            {
                this.setZonesOnCollection();
            }
        },

        getParsers: function()
        {
            return { 
                paceOrSpeed: _.bind(this.parsePaceOrSpeed, this),
                duration: TP.utils.conversion.parseDuration
            };
        },

        getFormatters: function()
        {
            return { 
                paceOrSpeed: _.bind(this.formatPaceOrSpeed, this),
                duration: TP.utils.conversion.formatDuration
            };
        },

        formatPaceOrSpeed: function(value, options)
        {
            options.defaultValue = "";
            if(this.model.get("paceOrSpeed") === "speed")
            {
                return TP.utils.conversion.formatSpeed(value, options);
            }
            else
            {
                return TP.utils.conversion.formatPace(value, options);
            }
        },

        parsePaceOrSpeed: function(value, options)
        {
            if(this.model.get("paceOrSpeed") === "speed")
            {
                return TP.utils.conversion.parseSpeed(value, options);
            }
            else
            {
                return TP.utils.conversion.parsePace(value, options);
            }
        },

        _applySourceValuesToModel: function()
        {
            _.each(this.fieldsToCopyFromThresholdSourceModel, function(key)
            {
                this.model.set(key, this.thresholdSourceModel.get(key));
            }, this);

            this.model.set("paceOrSpeed", this.unitsModel.get("units"));
        }

    });

    var EmptySpeedTabView = SpeedZoneCalculatorTabView.extend({
        calculators: [],
        inputs: [],
        formUtilsFilterSelector: ".thresholdTab"
    });

    var ThresholdSpeedTabView = SpeedZoneCalculatorTabView.extend({
        calculators: filterCalculators(ZoneCalculatorDefinitions.speedTypes.Threshold),
        inputs: [ "threshold" ],
        formUtilsFilterSelector: ".thresholdTab"
    });

    var HundredMeterTimeTabView = SpeedZoneCalculatorTabView.extend({

        calculators: filterCalculators(ZoneCalculatorDefinitions.speedTypes.SecondsPer100m),

        inputs: ["secondsPer100m"],

        formUtilsFilterSelector: ".hundredMeterTab",

        initialize: function()
        {
            SpeedZoneCalculatorTabView.prototype.initialize.apply(this, arguments);   
            this.model.set("paceOrSpeed", "pace");
            this.model.set("testDistance", ZoneCalculatorDefinitions.speedDistances.OneHundredMeters.id);
        },

        _applyFormValuesToModel: function()
        {
            ZoneCalculatorViews.TabContentView.prototype._applyFormValuesToModel.call(this);
            this._calculateSpeed();
        },

        _calculateSpeed: function()
        {
            var secondsPer100m = this.model.get("secondsPer100m");
            var metersPerSecond = 100 / secondsPer100m;

            // threshold speed is what the calculator actually uses
            this.model.set("threshold", metersPerSecond);
        }

    });

    var DistanceTimeTabView = SpeedZoneCalculatorTabView.extend({

        calculators: filterCalculators(ZoneCalculatorDefinitions.speedTypes.DistanceTime),

        inputs: ["testDistance", "speed", "duration"],

        formUtilsFilterSelector: ".distanceTab",

        events: _.extend({
            "change input[name=speedOrDuration]": "selectSpeedOrDuration"
        }, SpeedZoneCalculatorTabView.prototype.events),

        initialize: function()
        {
            SpeedZoneCalculatorTabView.prototype.initialize.apply(this, arguments);
            this.model.set("speedOrDuration", "speed");
            this.model.set("duration", 0);
        },

        clickZoneCalculator: function(e)
        {
            this.collection.reset();
            this._applyFormValuesToModel();
            this._selectZoneCalculator(e);
            this._setDistanceOptions();
            this._enableSpeedOrDuration();
            this._enableCalculate();
            this._calculateIfAllInputsAreValid();
            this.trigger("selectZoneCalculator");
        },

        selectSpeedOrDuration: function()
        {
            this._applyFormValuesToModel();
            this._enableSpeedOrDuration();
            this._applyModelValuesToForm();
        },

        _showInputs: function()
        {
            _.each(this.inputs, function(inputClass)
            {
                this.$("." + inputClass).removeClass("disabled");
            }, this);

            this._setDistanceOptions();

            this._enableSpeedOrDuration();
        },

        _setDistanceOptions: function()
        {
            if(this.calculatorDefinition)
            {
                var allowedDistances = _.map(this.calculatorDefinition.distances, function(distance){return distance.id;});

                if(!this.model.get("testDistance") || !_.contains(allowedDistances, this.model.get("testDistance")))
                {
                    this.model.set("testDistance", this.calculatorDefinition.distances[0].id);
                }

                var $select = this.$("select[name=testDistance]"); 
                $select.empty();
                _.each(this.calculatorDefinition.distances, function(distance)
                {
                    var $option = $("<option>").val(distance.id).text(distance.label);
                    $select.append($option);
                });

                this._applyModelValuesToForm();
            }
        },

        _enableSpeedOrDuration: function()
        {
            if(this.model.get("speedOrDuration") === "speed")
            {
                this.$("input[name=speed]").prop("disabled", false);
                this.$("input[name=duration]").prop("disabled", true);
            }
            else
            {
                this.$("input[name=speed]").prop("disabled", true);
                this.$("input[name=duration]").prop("disabled", false);
            }
        },

        _getRequiredInputs: function()
        {

            if(this.model.get("speedOrDuration") === "speed")
            {
                return ["testDistance", "speed"];
            }
            else
            {
                return ["testDistance", "duration"];
            }

        },

        _applyFormValuesToModel: function()
        {
            ZoneCalculatorViews.TabContentView.prototype._applyFormValuesToModel.call(this);
            this._calculateSpeedOrDuration();
        },

        _calculateSpeedOrDuration: function()
        {

            if(!this.calculatorDefinition)
            {
                return;
            }

            var distanceId = this.model.get("testDistance");
            var distanceDefinition = _.find(this.calculatorDefinition.distances, function(distance)
            {
                return distance.id === distanceId;
            });

            if(!distanceDefinition)
            {
                return;
            }

            var durationInHours, durationInSeconds, speedInMetersPerSecond;
            if(this.model.get("speedOrDuration") === "speed")
            {
                speedInMetersPerSecond = this.model.get("speed");

                if(speedInMetersPerSecond >= 0.1)
                {
                    durationInSeconds = distanceDefinition.distanceInMeters / speedInMetersPerSecond;
                    durationInHours = durationInSeconds / 3600;
                    this.model.set("duration", durationInHours);
                }
                else
                {
                    this.model.set("duration", 0);
                }
            }
            else
            {
                durationInHours = this.model.get("duration");
                durationInSeconds = durationInHours * 3600;

                if(durationInSeconds)
                {
                    speedInMetersPerSecond = distanceDefinition.distanceInMeters / durationInSeconds;
                    this.model.set("speed", speedInMetersPerSecond);
                }
                else
                {
                    this.model.set("speed", 0);
                }
            }

            // threshold speed is what the calculator actually uses
            this.model.set("threshold", this.model.get("speed"));
        }


    });

    var SpeedZonesCalculatorTabbedLayout = ZoneCalculatorViews.TabbedLayout.extend({

        className: "tabbedLayout zonesCalculator speedZonesCalculator",

        _initializeNavigation: function()
        {
            this.navigation =
            [
                {
                    title: "Choose Type",
                    view: EmptySpeedTabView,
                    options: _.defaults({
                        model: new TP.Model(TP.utils.deepClone(this.model.attributes)),
                        thresholdSourceModel: this.model
                    }, this.options)
                },
                {
                    title: "Threshold Speed",
                    view: ThresholdSpeedTabView,
                    options: _.defaults({
                        model: new TP.Model(TP.utils.deepClone(this.model.attributes)),
                        thresholdSourceModel: this.model
                    }, this.options)
                },
                {
                    title: "Distance / Time",
                    view: DistanceTimeTabView,
                    options: _.defaults({
                        model: new TP.Model(TP.utils.deepClone(this.model.attributes)),
                        thresholdSourceModel: this.model
                    }, this.options)
                },
                {
                    title: "Seconds / 100m",
                    view: HundredMeterTimeTabView,
                    options: _.defaults({
                        model: new TP.Model(TP.utils.deepClone(this.model.attributes)),
                        thresholdSourceModel: this.model
                    }, this.options)
                }
            ];
        }

    });

    return SpeedZonesCalculatorTabbedLayout;

});
