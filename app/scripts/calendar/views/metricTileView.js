define(
[
    "underscore",
    "TP",
    "calendar/views/metricTileSettingsView",
    "hbs!calendar/templates/metricTileTemplate"
],
function(
    _,
    TP,
    MetricTileSettingsView,
    metricTileTemplate
)
{

    var CalendarMetricView = TP.ItemView.extend({

        showThrobbers: false,
        className: "metric metricDiv",

        template:
        {
            type: "handlebars",
            template: metricTileTemplate
        },

        events:
        {
            "click .metricSettings": "_onSettingsClicked"
        },

        initialize: function()
        {
            this.on("render", this._setupDraggable, this);
        },

        _setupDraggable: function()
        {
            this.$el.data("ItemId", this.model.id);
            this.$el.data("ItemType", this.model.webAPIModelName);
            this.$el.data("DropEvent", "itemMoved");

            var draggableOptions =
            {
                appendTo: theMarsApp.getBodyElement(),
                helper: "clone",
                start: _.bind(this._onDragStart, this),
                stop: _.bind(this._onDragStop, this),
                containment: "#calendarWrapper",
                addClasses: false
            };
            this.$el.draggable(draggableOptions);
        },

        _onDragStart: function()
        {
        },

        _onDragStop: function()
        {
        },

        _onSettingsClicked: function(e)
        {
            var offset = $(e.currentTarget).offset();
            var settingsView = new MetricTileSettingsView({ model: this.model });
            settingsView.render().bottom(offset.top + 12).center(offset.left - 4);
        }

    });

    return CalendarMetricView;
});
