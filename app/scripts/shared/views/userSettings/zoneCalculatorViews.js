define(
[
    "jquery",
    "underscore",
    "setImmediate",
    "TP",
    "shared/views/selectableLayout",
    "shared/utilities/formUtility",
    "views/userConfirmationView",
    "hbs!templates/views/confirmationViews/requiredFieldTemplate",
    "hbs!shared/templates/userSettings/unableToCalculateZonesTemplate",
    "hbs!shared/templates/userSettings/zonesCalculatorFooterTemplate",
    "hbs!shared/templates/userSettings/zoneThresholdTemplate",
    "hbs!shared/templates/userSettings/zonesCalculatorLayout"
],
function(
    $,
    _,
    setImmediate,
    TP,
    SelectableLayout,
    FormUtility,
    UserConfirmationView,
    requiredFieldTemplate,
    unableToCalculateZonesTemplate,
    zonesCalculatorFooterTemplate,
    zoneThresholdTemplate,
    zonesCalculatorLayoutTemplate
)
{

    var ZoneCalculatorLayout = SelectableLayout.extend({

        className: "zoneCalculatorLayout",

        template:
        {
            type: "handlebars",
            template: zonesCalculatorLayoutTemplate
        },

        regions:
        {
            bodyRegion: ".zoneCalculatorLayoutBody",
            footerRegion: ".zoneCalculatorLayoutFooter"
        },

        constructor: function()
        {
            SelectableLayout.apply(this, arguments);
            this.off("render", this._renderNavigation, this);
            this.on("after:switchView", this._renderNavigation, this);
        },

        _renderNavigation: function()
        {
            var $nav = this.$("select[name=calculatorType]");
            $nav.empty();
            _.each(this._getNavigationElements(), function($item)
            {
                $nav.append($item);
            }, this);
            $nav.change(_.bind(this._onCalculatorTypeSelect, this));
        },

        _onCalculatorTypeSelect: function()
        {
            var selectedTitle = this.$("select[name=calculatorType]").val();
            var navItem = _.find(this.navigation, function(item)
            {
                return item.title === selectedTitle;
            });
            if(navItem)
            {
                this._selectView(navItem);
            }
        },

        _getNavigationElements: function()
        {
            var navElements = [];
            var self = this;
            _.each(this.navigation, function(navItem)
            {
                var $item = $("<option>").text(navItem.title);
                if(navItem === this.currentNavItem)
                {
                    $item.prop("selected", true);
                }
                navElements.push($item);
            }, this);

            return navElements;
        },

        _scrollTo: function(subNavItem, $subItem)
        {
            var target = this.$(".zoneCalculatorLayoutBody").find(subNavItem.target);
            var $container = this.$(".zoneCalculatorLayoutBody");
            $container.animate({
                scrollTop: target.position().top + $container.scrollTop()
            });
        }

    });

    var CalculatorTabContentView = TP.CompositeView.extend({

        itemViewContainer: ".zones.zoneCalculatorView",

        units: "number",

        formUtilsFilterSelector: "input",
        
        fieldsToCopyFromThresholdSourceModel: ["threshold"],

        zoneItemView: TP.ItemView,

        thresholdItemView: TP.ItemView.extend({
            className: "zoneCalculatorResult threshold",
            template: {
                type: "handlebars",
                template: zoneThresholdTemplate
            }
        }),

        constructor: function(options)
        {

            if(!options.thresholdSourceModel)
            {
                throw new Error("ZonesCalculatorView requires a thresholdSourceModel");
            }

            // start with no zones until we run calculator
            this.collection = new TP.Collection();
            //this.calculatorDefinition = this.calculators[0];
            CalculatorTabContentView.__super__.constructor.apply(this, arguments);
            this.thresholdSourceModel = options.thresholdSourceModel;
            this.originalModelClone = options.model.clone();
            this.modelsById = {};
            this.model = this._getModelForCurrentCalculator(); 
            this.createItemViewFactory();
        },

        createItemViewFactory: function()
        {
            this.itemView = function(options)
            {
                var ViewClass = options.model.has("threshold") ? this.thresholdItemView : this.zoneItemView;
                return new ViewClass(options);
            };

            this.itemView.prototype.thresholdItemView = this.thresholdItemView;
            this.itemView.prototype.zoneItemView = this.zoneItemView;
        },

        onRender: function()
        {
            this._applyModelValuesToForm();
            this._showInputs();
            this._enableCalculate();
            //this._calculateIfAllInputsAreValid();
        },

        events: {
            "change select[name=calculatorDefinitionId]": "clickZoneCalculator",
            "click .calculate": "calculateZones"
        },

        modelEvents: {},

        serializeData: function()
        {

            var data = this.model.toJSON();
            data.calculators = this.calculators;
            data.calculatorTypes = this.calculatorTypes;
            _.each(data.calculators, function(calc)
            {
                calc.selected = calc === this.calculatorDefinition;
            }, this);
            return data;
        },

        clickZoneCalculator: function(e)
        {
            this.collection.reset();
            this._applyFormValuesToModel();
            this._selectZoneCalculator(e);
            this._enableCalculate();
            this._calculateIfAllInputsAreValid();
            this.trigger("selectZoneCalculator");
        },

        reset: function()
        {
            this.collection.reset();
        },

        _enableCalculate: function()
        {
            this.$(".calculate").prop("disabled", this.calculatorDefinition ? false : true);
        },

        _selectZoneCalculator: function(e)
        {
            var calculatorId = Number($(e.target).val());
            this.calculatorDefinition = calculatorId ? this.zoneTypesById[calculatorId] : null;

            this.model = this._getModelForCurrentCalculator(); 

            this._applyModelValuesToForm();
        },

        _getModelForCurrentCalculator: function()
        {
            if(!this.calculatorDefinition)
            {
                return this.originalModelClone.clone();
            }

            var calculatorId = this.calculatorDefinition.id;
            if(!this.modelsById[calculatorId])
            {
                this.modelsById[calculatorId] = this.originalModelClone.clone();
            }
            return this.modelsById[calculatorId];
        },

        _calculateIfAllInputsAreValid: function()
        {
            // because the original model could be changed outside the calculator view
            this._applySourceValuesToModel();

            if(this._validateInputs(false))
            {
                this.calculateZones();
            }
        },

        _applySourceValuesToModel: function()
        {
            _.each(this.fieldsToCopyFromThresholdSourceModel, function(key)
            {
                this.model.set(key, this.thresholdSourceModel.get(key));
            }, this);
        },

        calculateZones: function()
        {

            // because the original model could be changed outside the calculator view
            // do this before we apply form values as we may want to override some
            this._applySourceValuesToModel();
            
            this._applyFormValuesToModel();

            if(!this._validateInputs(true))
            {
                return;
            }

            var zoneCalculator = new this.zoneCalculator(this.calculatorDefinition);

            var self = this;
            zoneCalculator.calculate(this.model).done(function()
            {
                self.setZonesOnCollection(); 
                self._applyModelValuesToForm();
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

        setZonesOnCollection: function()
        {
            var zones = TP.utils.deepClone(this.model.get("zones"));
            var threshold = new TP.Model({ threshold: this.model.get("threshold"), units: this.units, workoutTypeId: this.model.get("workoutTypeId") });
            zones.unshift(threshold);
            this.collection.reset(zones);
        },

        getZonesToApply: function()
        {
            this._applyValuesToOriginalModelClone();
            return this.originalModelClone;
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

        _applyValuesToOriginalModelClone: function()
        {
            var attributesInCalculatorModel = _.keys(this.model.attributes);
            var attributesInoriginalModelClone = _.keys(this.originalModelClone.attributes);
            var attributesInBothModels = _.intersection(attributesInCalculatorModel, attributesInoriginalModelClone);

            _.each(attributesInBothModels, function(key) {
                this.originalModelClone.set(key, this.model.get(key));
            }, this);
        },

        _parseInputValue: function(value)
        {
            var options = { defaultValue: 0, workoutTypeId: this.model.get("workoutTypeId") };
            return TP.utils.conversion.parseUnitsValue(this.units, value, options);
        },

        _formatInputValue: function(value)
        {
            var options = { defaultValue: "", workoutTypeId: this.model.get("workoutTypeId") };
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
            _.each(this._getInitialEnabledInputs(), function(inputClass)
            {
                this.$("." + inputClass).removeClass("disabled");
            }, this);
        },

        _getInitialEnabledInputs: function()
        {
            return this.inputs;
        },

        _validateInputs: function(showMessage)
        {
            return this._validateRequiredFields(showMessage);
        },

        _validateRequiredFields: function(showMessage)
        {
            var success = true;
            _.each(this._getRequiredInputs(), function(attr)
            {
                if(!this.model.get(attr))
                {
                    if(showMessage)
                    {
                        this.showRequiredFieldMessage(attr);
                    }
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

    var TabbedZonesCalculatorView = ZoneCalculatorLayout.extend({

        initialize: function(options)
        {
            // Compatibility for speedZonesCalculatorView
            this.options = options;
            this._initializeNavigation(options);
            this._initializeFooter();
        },

        _initializeFooter: function()
        {
            this.footerView = new CalculatorFooterView();
            this.on("render", this._showFooter, this);
            this.listenTo(this.footerView, "cancel", _.bind(this._cancel, this));
            this.listenTo(this.footerView, "apply", _.bind(this._apply, this));
            this.on("before:switchView", this.resetFooter, this);
            this.on("itemView:calculate", this.enableFooter, this);
        },

        _showFooter: function()
        {
            this.footerRegion.show(this.footerView);
            this.resetFooter();
        },

        _apply: function()
        {
            this.trigger("apply", this.currentView.getZonesToApply());
            this.reset();
        },

        _cancel: function()
        {
            this.reset();
        },

        reset: function()
        {
            this.currentView.reset();
            this.resetFooter();
        },

        resetFooter: function()
        {
            this.footerView.disableButton("apply");
            this.footerView.disableButton("cancel");
        },

        enableFooter: function()
        {
            this.footerView.enableButton("apply");
            this.footerView.enableButton("cancel");
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
