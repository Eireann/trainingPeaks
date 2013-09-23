define(
[
    "underscore",
    "TP",
    "shared/views/tabbedLayout",
    "shared/utilities/formUtility",
    "views/userConfirmationView",
    "hbs!templates/views/confirmationViews/requiredFieldTemplate",
    "hbs!shared/templates/userSettings/zonesCalculatorFooterTemplate"
],
function(
    _,
    TP,
    TabbedLayout,
    FormUtility,
    UserConfirmationView,
    requiredFieldTemplate,
    zonesCalculatorFooterTemplate
)
{

    var CalculatorTabContentView = TP.CompositeView.extend({

        itemViewContainer: ".zones",

        units: "number",

        constructor: function(options)
        {
            // start with no zones until we run calculator
            this.collection = new TP.Collection();
            CalculatorTabContentView.__super__.constructor.apply(this, arguments);
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
            data.calculators = _.sortBy(this.calculators, "label");
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
            var calculatorDefinition = this.zoneTypesById[calculatorId];
            var zoneCalculator = new this.zoneCalculator(calculatorDefinition);

            var self = this;
            zoneCalculator.calculate(this.model).done(function()
            {
                self.collection.reset(self.model.get("zones"));
                self._applyModelValuesToForm();
                self.trigger("calculate");
            });

        },

        getZonesToApply: function()
        {
            return this.model;
        },

        _parseZoneValue: function(value)
        {
            var options = { defaultValue: 0, workoutTypeId: this.model.get("workoutTypeId") };
            return TP.utils.conversion.parseUnitsValue(this.units, value, options);
        },

        _formatZoneValue: function(value)
        {
            var options = { defaultValue: "0", workoutTypeId: this.model.get("workoutTypeId") };
            return TP.utils.conversion.formatUnitsValue(this.units, value, options);
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
                    this._showRequiredFieldMessage(attr);
                    success = false;
                }
            }, this);
            return success;
        },

        _showRequiredFieldMessage: function(fieldName)
        {
            if(!this.confirmationView)
            {
                this.confirmationView = new UserConfirmationView(
                {
                    template: requiredFieldTemplate,
                    model: new TP.Model({ fieldName: fieldName.replace(/([A-Z])/g, " $1").toLowerCase() })
                });

                this.confirmationView.render();

                this.confirmationView.on("close", function()
                {
                    this.confirmationView = null;
                    this.$("." + fieldName).focus();
                }, this);
            }
        }

    });

    var TabbedZonesCalculatorView = TabbedLayout.extend({

        initialize: function()
        {
            this._initializeNavigation();
            this._initializeFooter();
        },

        _initializeFooter: function()
        {
            this.footerView = new CalculatorFooterView();
            this.on("render", this._showFooter, this);
            this.listenTo(this.footerView, "cancel", _.bind(this.close, this));
            this.listenTo(this.footerView, "apply", _.bind(this._apply, this));

            this.on("currentview:calculate", _.bind(function()
            {
                this.footerView.enableButton("apply");   
            }, this));
        },

        _showFooter: function()
        {
            this.tabbedLayoutFooterRegion.show(this.footerView);
            this.footerView.disableButton("apply");
        },

        _apply: function()
        {
            this.trigger("apply", this.currentView.getZonesToApply());
            this.close();
        }
        
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
        },

        disableButton: function(buttonClass)
        {
            this.$("button." + buttonClass).prop("disabled", true);
        },

        enableButton: function(buttonClass)
        {
            this.$("button." + buttonClass).prop("disabled", false);
        }
    });

    return {
        TabbedLayout: TabbedZonesCalculatorView,
        TabContentView: CalculatorTabContentView,
        TabFooterView: CalculatorFooterView
    };
});
