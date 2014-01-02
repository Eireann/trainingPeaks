define(
[
    "underscore",
    "TP",
    "backbone",
    "shared/utilities/formUtility",
    "shared/views/userSettings/zoneEntryView",
    "jqueryui/sortable"
],
function(
    _,
    TP,
    Backbone,
    FormUtility,
    ZoneEntryView,
    jqueryuiSortable
)
{

    var ZonesConfigGroupView = TP.CompositeView.extend({

        className: "zonesConfigGroup",

        itemView: ZoneEntryView,
        itemViewContainer: ".zones.zonesConfigGroupView",

        modelEvents: {},

        events:
        {
            "click .addZone": "_addZone",
            "click .removeWorkoutType": "_removeWorkoutType",
            "change input[data-format=zoneValue]": "_refreshValues"
        },

        applyModelValuesToForm: function(options)
        {
            options = _.extend({
                filterSelector: "[data-scope='zoneSet']",
                formatters: this.getFormatters()
            }, options);
            
            this.children.call("applyModelValuesToForm");
            FormUtility.applyValuesToForm(this.$el, this.model, options);
        },

        constructor: function(options)
        {
            this.collection = new TP.Collection(options.model.get("zones"));
            ZonesConfigGroupView.__super__.constructor.apply(this, arguments);
            this.on("render", this.bindFormValuesToModels, this);
            this.on("render", this._makeSortable, this);
            this.on("render", this._renderCalculator, this);
            this.on("before:item:added", this._addedItems, this);
        },

        bindFormValuesToModels: function()
        {
            var self = this;
            this.listenTo(this.collection, "add remove reset change", function()
            {
                self._refreshView();
                self._setZonesOnModel();
            });

            FormUtility.bindFormToModel(this.$el, this.model, {
                filterSelector: "[data-scope='zoneSet']",
                parsers: this.getParsers(),
                formatters: this.getFormatters()
            });
        },

        formatValue: function(value)
        {
            var options = { defaultValue: "0", workoutTypeId: this.model.get("workoutTypeId") };
            return TP.utils.conversion.formatUnitsValue("number", value, options);
        },

        parseValue: function(value)
        {
            var options = { workoutTypeId: this.model.get("workoutTypeId") };
            return TP.utils.conversion.parseUnitsValue("number", value, options);
        },

        getFormatters: function()
        {
            return {
                zoneValue: _.bind(this.formatValue, this)
            };
        },

        getParsers: function()
        {
            return {
                zoneValue: _.bind(this.parseValue, this)
            };
        },

        _renderCalculator: function()
        {
            this.calculatorView = this.getZonesCalculatorView();
            this.calculatorView.render();
            this.$(".calculator").append(this.calculatorView.$el);
            this.listenTo(this.calculatorView, "apply", _.bind(this.applyCalculatorZones, this));
            this.on("close", _.bind(this.calculatorView.close, this.calculatorView));
        },

        getZonesCalculatorView: function()
        {
            return new this.ZonesCalculatorView({ model: this.model });
        },

        applyCalculatorZones: function(model)
        {
            this.model.set(model.attributes);
            this.collection.reset(model.get("zones")); 
            this.applyModelValuesToForm({ trigger: true });
        },

        _makeSortable: function()
        {
            this.$(".zones.zonesConfigGroupView").sortable({
                axis: "y",
                stop: _.bind(this._updateSort, this),
                scope: "zonesSettingsList"
            });
        },

        _updateSort: function()
        {
            var cids = this.$(".zones.zonesConfigGroupView").sortable("toArray", { attribute: "data-mcid" });
            var models = _.map(cids, function(cid) { return this.collection.get(cid); }, this);
            this.collection.reset(models, { silent: true });
            this._setZonesOnModel();
        },

        _addZone: function()
        {
            this.collection.add({});
        },

        _removeWorkoutType: function()
        {
            this.model.destroy();
        },

        _refreshView: function()
        {
            this.$(".addZone").toggle(this.collection.length < 10);
        },

        _addedItems: function(view)
        {
            view.setFormatter(_.bind(this.formatValue, this));
            view.setParser(_.bind(this.parseValue, this));
        },

        _setZonesOnModel: function()
        {
            this.model.set("zones", this.collection.toJSON());
        }

    });

    return ZonesConfigGroupView;

});
