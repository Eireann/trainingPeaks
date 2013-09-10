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

    var ZonesTypeView = TP.CompositeView.extend({

        itemView: ZoneEntryView,
        itemViewContainer: ".zones",

        modelEvents: {},

        events:
        {
            "click .addZone": "_addZone"
        },

        _applyZoneSetDataOnRender: function()
        {
            FormUtility.applyValuesToForm(this.$el, this.model, {
                filterSelector: "[data-scope='zoneSet']",
                formatters: this.getFormatters()
            });
        },

        constructor: function(options)
        {
            this.collection = new TP.Collection(options.model.get("zones"));
            ZonesTypeView.__super__.constructor.apply(this, arguments);
            this.on("render", this._applyZoneSetDataOnRender, this);
            this.on("render", this._makeSortable, this);
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

        getFormatters: function()
        {
            return {};
        },

        getParsers: function()
        {
            return {};
        },

        _makeSortable: function()
        {
            this.$(".zones").sortable({
                axis: "y",
                stop: _.bind(this._updateSort, this)
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

        _refreshView: function()
        {
            this.$(".addZone").toggle(this.collection.length < 10);
        }

    });

    return ZonesTypeView;

});



