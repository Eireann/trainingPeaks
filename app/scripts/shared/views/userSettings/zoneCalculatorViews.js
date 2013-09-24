define(
[
    "underscore",
    "TP",
    "shared/views/tabbedLayout",
    "shared/utilities/formUtility",
    "views/userConfirmationView",
    "hbs!templates/views/confirmationViews/requiredFieldTemplate",
    "hbs!shared/templates/userSettings/unableToCalculateZonesTemplate",
    "hbs!shared/templates/userSettings/zonesCalculatorFooterTemplate"
],
function(
    _,
    TP,
    TabbedLayout,
    FormUtility,
    UserConfirmationView,
    requiredFieldTemplate,
    unableToCalculateZonesTemplate,
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
            this.calculatorDefinition = _.sortBy(this.calculators, "label")[0];
            CalculatorTabContentView.__super__.constructor.apply(this, arguments);
        },

        onRender: function()
        {
            this._highlightSelectedZone();
            this._applyModelValuesToForm();
            this._showInputs();
            this._enableCalculate();
        },

        events: {
            "click .calculator": "clickZoneCalculator",
            "click .calculate": "calculateZones"
        },

        modelEvents: {},

        serializeData: function()
        {

            var data = this.model.toJSON();
            data.calculators = _.sortBy(this.calculators, "label");
            return data;
        },

        clickZoneCalculator: function(e)
        {
            this.collection.reset();
            this._selectZoneCalculator(e);
            this._highlightSelectedZone();
            this._enableCalculate();
        },

        _enableCalculate: function()
        {
            this.$(".calculate").prop("disabled", this.calculatorDefinition ? false : true);
        },

        _selectZoneCalculator: function(e)
        {
            var calculatorId = Number($(e.target).data("zoneid"));
            this.calculatorDefinition = this.zoneTypesById[calculatorId];
        },

        _highlightSelectedZone: function()
        {
            this.$("li.selected").removeClass("selected");

            if(this.calculatorDefinition)
            {
                this.$("a[data-zoneid=" + this.calculatorDefinition.id + "]").closest("li").addClass("selected"); 
            }
        },

        calculateZones: function()
        {

            this._applyFormValuesToModel();

            if(!this.validateInputs())
            {
                return;
            }

            var zoneCalculator = new this.zoneCalculator(this.calculatorDefinition);

            var self = this;
            zoneCalculator.calculate(this.model).done(function()
            {
                self.collection.reset(self.model.get("zones"));
                self._applyModelValuesToForm();
                self._highlightSelectedZone();
                self.trigger("calculate");
            }).fail(function()
            {
                 this.confirmationView = new UserConfirmationView(
                {
                    template: unableToCalculateZonesTemplate
                });               

                this.confirmationView.render();

                this.confirmationView.on("close", function()
                {
                    this.confirmationView = null;
                }, this);
            });
        },

        getZonesToApply: function()
        {
            return this.model;
        },

        getParsers: function()
        {
            return { zoneValue: _.bind(this._parseInputValue, this) };
        },

        getParserOptions: function()
        {
            return {workoutTypeId: this.model.get("workoutTypeId")};
        },

        getFormatters: function()
        {
            return { zoneValue: _.bind(this._formatInputValue, this) };
        },

        getFormatterOptions: function()
        {
            return {
                defaultValue: "",
                workoutTypeId: this.model.get("workoutTypeId")
            };
        },

        _parseInputValue: function(value)
        {
            var options = { defaultValue: 0, workoutTypeId: this.model.get("workoutTypeId") };
            return TP.utils.conversion.parseUnitsValue(this.units, value, options);
        },

        _formatInputValue: function(value)
        {
            var options = { defaultValue: "0", workoutTypeId: this.model.get("workoutTypeId") };
            return TP.utils.conversion.formatUnitsValue(this.units, value, options);
        },

        _applyModelValuesToForm: function()
        {
            FormUtility.applyValuesToForm(this.$el, this.model, 
                                            { 
                                                formatters: this.getFormatters(),
                                                formatterOptions: this.getFormatterOptions(),
                                                filterSelector: this.formUtilsFilterSelector
                                            }
                                        );
        },

        _applyFormValuesToModel: function()
        {
            FormUtility.applyValuesToModel(this.$el, this.model, 
                                            { 
                                                parsers: this.getParsers(),
                                                parserOptions: this.getParserOptions(),
                                                filterSelector: this.formUtilsFilterSelector
                                            }
                                        );
        },

        _showInputs: function()
        {
            _.each(this.inputs, function(inputClass)
            {
                this.$("." + inputClass).removeClass("disabled");
            }, this);
        },

        validateInputs: function()
        {
            return this._validateRequiredFields();
        },

        _validateRequiredFields: function()
        {
            var success = true;
            _.each(this._getRequiredInputs(), function(attr)
            {
                if(!this.model.get(attr))
                {
                    this.showRequiredFieldMessage(attr);
                    success = false;
                }
            }, this);
            return success;
        },

        _getRequiredInputs: function()
        {
            return this.inputs;
        },

        showRequiredFieldMessage: function(fieldName, allowedValues)
        {
            if(!this.confirmationView)
            {
                var niceFieldName = fieldName.replace(/([A-Z])/g, " $1").replace(/([0-9])([a-zA-Z])/g,"$1 $2").replace(/([a-zA-Z])([0-9])/g,"$1 $2").toLowerCase();

                this.confirmationView = new UserConfirmationView(
                {
                    template: requiredFieldTemplate,
                    model: new TP.Model({ fieldName: niceFieldName, allowedValues: allowedValues })
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

        initialize: function(options)
        {
            this._initializeNavigation(options);
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
