define(
[
    "underscore",
    "TP",
    "hbs!templates/views/calendar/metric/calendarMetric"
],
function(
    _,
    TP,
    calendarMetricTemplate
)
{

    var CalendarMetricView = TP.ItemView.extend({

        showThrobbers: false,
        className: "metric metricDiv",

        template:
        {
            type: "handlebars",
            template: calendarMetricTemplate
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

        _draggableHelper: function()
        {
        },

        _onDragStart: function()
        {
        },

        _onDragStop: function()
        {
        }

    });

    return CalendarMetricView;
});
