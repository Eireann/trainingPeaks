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
        itemViewContainer: ".zones",

        modelEvents: {},

        events:
        {
            "click .addZone": "_addZone",
            "click .removeWorkoutType": "_removeWorkoutType",
            "change input[data-format=zoneValue]": "_refreshValues"
        },

        applyModelValuesToForm: function()
        {
            this.children.call("applyModelValuesToForm");
            FormUtility.applyValuesToForm(this.$el, this.model, {
                filterSelector: "[data-scope='zoneSet']",
                formatters: this.getFormatters()
            });
        },

        constructor: function(options)
        {
            this.collection = new TP.Collection(options.model.get("zones"));
            ZonesConfigGroupView.__super__.constructor.apply(this, arguments);
            this.on("render", this.applyModelValuesToForm, this);
            this.on("render", this._makeSortable, this);
            this.on("before:item:added", this._addedItems, this);
            this.listenTo(this.collection, "add remove reset", _.bind(this._refreshView, this));
        },

        applyFormValuesToModels: function()
        {
            this.children.call("applyFormValuesToModels");
            this.model.set("zones", this.collection.toJSON());
            FormUtility.applyValuesToModel(this.$el, this.model, {
                filterSelector: "[data-scope='zoneSet']",
                parsers: this.getParsers()
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

        _makeSortable: function()
        {
            this.$(".zones").sortable({
                axis: "y",
                stop: _.bind(this._updateSort, this),
                scope: "zonesSettingsList"
            });
        },

        _updateSort: function()
        {
            var cids = this.$(".zones").sortable("toArray", { attribute: "data-mcid" });
            var models = _.map(cids, function(cid) { return this.collection.get(cid); }, this);
            this.collection.reset(models, { silent: true });
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

        _refreshValues: function()
        {
            this.applyFormValuesToModels();
            this.applyModelValuesToForm();
        },

        _addedItems: function(view)
        {
            view.setFormatter(_.bind(this.formatValue, this));
            view.setParser(_.bind(this.parseValue, this));
        }

    });

    return ZonesConfigGroupView;

});



