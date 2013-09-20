define(
[
    "underscore",
    "TP",
    "backbone",
    "shared/views/tabbedLayout",
    "shared/views/overlayBoxView",
    "shared/data/zoneCalculators",
    "shared/utilities/zoneCalculator",
    "shared/utilities/formUtility",
    "hbs!shared/templates/userSettings/heartRateZonesCalculatorZoneItemTemplate",
    "hbs!shared/templates/userSettings/heartRateZonesCalculatorTemplate",
    "hbs!shared/templates/userSettings/zonesCalculatorFooterTemplate"
],
function(
    _,
    TP,
    Backbone,
    TabbedLayout,
    OverlayBoxView,
    ZoneCalculatorDefinitions,
    ZoneCalculator,
    FormUtility,
    heartRateZoneTemplate,
    heartRateZonesCalculatorTemplate,
    zonesCalculatorFooterTemplate
)
{

    var CalculatorTabView = TP.CompositeView.extend({

        itemView: TP.ItemView.extend({
            template: {
                type: "handlebars",
                template: heartRateZoneTemplate
            }
        }),

        itemViewContainer: ".zones",

        template: {
            type: "handlebars",
            template: heartRateZonesCalculatorTemplate
        },

        constructor: function(options)
        {
            // start with no zones until we run calculator
            this.collection = new TP.Collection();
            CalculatorTabView.__super__.constructor.apply(this, arguments);
        },

        onRender: function()
        {
            this._applyModelValuesToForm();
            this._showInputs();
        },

        events: {
            "click .calculator": "calculateZones"
        },

        serializeData: function()
        {

            var data = this.model.toJSON();

            var calculators = _.filter(ZoneCalculatorDefinitions.heartRate, function(zoneCalculator)
            {
                return zoneCalculator.type === this.zoneCalculatorType;
            }, this);

            data.calculators = _.sortBy(calculators, "label");

            return data;
        },

        calculateZones: function(e)
        {

            FormUtility.applyValuesToModel(this.$el, this.model, { parsers: { zoneValue: _.bind(this._parseZoneValue, this) } });

            if(!this._validateInputs())
            {
                return;
            }

            var calculatorId = Number($(e.target).data("zoneid"));
            var calculatorDefinition = ZoneCalculatorDefinitions.heartRatesById[calculatorId];

            var zoneCalculator = new ZoneCalculator.HeartRate(calculatorDefinition);

            var self = this;
            zoneCalculator.calculate(this.model).done(function()
            {
                self.collection.reset(self.model.get("zones"));
                self._applyModelValuesToForm();
            });

        },

        applyZones: function()
        {
            alert('not implemented');
        },

        _parseZoneValue: function(value)
        {
            var options = { defaultValue: 0, workoutTypeId: this.model.get("workoutTypeId") };
            return TP.utils.conversion.parseUnitsValue("heartrate", value, options);
        },

        _formatZoneValue: function(value)
        {
            var options = { defaultValue: "0", workoutTypeId: this.model.get("workoutTypeId") };
            return TP.utils.conversion.formatUnitsValue("heartrate", value, options);
        },

        _applyModelValuesToForm: function()
        {
            FormUtility.applyValuesToForm(this.$el, this.model, { formatters: { zoneValue: _.bind(this._formatZoneValue, this) } });
        },

        _showInputs: function()
        {
            _.each(this.inputs, function(inputClass)
            {
                this.$("." + inputClass).removeClass("disabled");
            }, this);
        },

        _validateInputs: function()
        {
            var success = true;
            _.each(this.inputs, function(attr)
            {
                if(!this.model.get(attr))
                {
                    alert("Please enter a value for " + attr);
                    success = false;
                }
            }, this);
            return success;
        }

    });

    var  LactateThresholdTabView = CalculatorTabView.extend({  
        zoneCalculatorType: ZoneCalculatorDefinitions.heartRateTypes.LactateThreshold,
        inputs: [ "threshold" ]
    });

    var  MaximumHeartRateTabView = CalculatorTabView.extend({
        zoneCalculatorType: ZoneCalculatorDefinitions.heartRateTypes.MaximumHeartRate,
        inputs: [ "maximumHeartRate" ]
    });

    var  MaximumAndRestingHeartRateTabView = CalculatorTabView.extend({
         zoneCalculatorType: ZoneCalculatorDefinitions.heartRateTypes.MaxAndRestingHeartRate,
         inputs: [ "maximumHeartRate", "restingHeartRate"]
    });

    var LactateThresholdAndMaximumHeartRateTabView = CalculatorTabView.extend({
         zoneCalculatorType: ZoneCalculatorDefinitions.heartRateTypes.LTAndMaxHeartRate,
         inputs: [ "maximumHeartRate", "testResult" ]
    });

    // todo: extract this and user settings footer into a simple button view?
    var CalculatorFooterView = TP.ItemView.extend({

        className: "userSettingsButtons",
        
        template:
        {
            type: "handlebars",
            template: zonesCalculatorFooterTemplate
        },

        events:
        {
            "click button": "triggerButton"
        },

        triggerButton: function(e)
        {
            var actionName = $(e.currentTarget).attr("class");
            this.trigger(actionName);
        }
    });

    var HeartRateZonesCalculatorView = TabbedLayout.extend({

        initialize: function()
        {
            this._initializeNavigation();
            this._initializeFooter();
        },

        _initializeNavigation: function()
        {
            this.navigation =
            [
                {
                    title: "Lactate Threshold",
                    view: LactateThresholdTabView,
                    options: {
                        model: new TP.Model(TP.utils.deepClone(this.model.attributes)) 
                    }
                },
                {
                    title: "Maximum Heart Rate",
                    view: MaximumHeartRateTabView,
                    options: {
                        model: new TP.Model(TP.utils.deepClone(this.model.attributes)) 
                    }
                },
                {
                    title: "Max and Resting Heart Rate",
                    view: MaximumAndRestingHeartRateTabView,
                    options: {
                        model: new TP.Model(TP.utils.deepClone(this.model.attributes)) 
                    }
                },
                {
                    title: "LT and Maximum Heart Rate",
                    view: LactateThresholdAndMaximumHeartRateTabView,
                    options: {
                        model: new TP.Model(TP.utils.deepClone(this.model.attributes)) 
                    }
                }
            ];
        },

        _initializeFooter: function()
        {
            this.footerView = new CalculatorFooterView();
            this.on("render", this._showFooter, this);
            this.listenTo(this.footerView, "cancel", _.bind(this.close, this));
            this.listenTo(this.footerView, "apply", _.bind(this._apply, this));
        },

        _showFooter: function()
        {
            this.tabbedLayoutFooterRegion.show(this.footerView);
        },

        _apply: function()
        {
            this.currentView.applyZones();
            this.close();
        }

    });

    return OverlayBoxView.extend({
        className: "heartRateZonesCalculator zonesCalculator",
        itemView: HeartRateZonesCalculatorView
    });

});
