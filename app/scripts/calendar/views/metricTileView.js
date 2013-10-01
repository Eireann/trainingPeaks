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
            "click .metricSettings": "_onSettingsClicked",
            "mouseup": "_onMouseup",
            "mousedown": "_onMousedown"
        },

        modelEvents:
        {
            "select": "_onSelected",
            "unselect": "_onUnselected"
        },

        initialize: function()
        {
            this.on("render", this._setupDraggable, this);
            this.on("render", this._presetSelected, this);
            this.listenTo(theMarsApp.user, "change:units", _.bind(this.render, this));
        },

        _setupDraggable: function()
        {
            this.$el.data("ItemId", this.model.id);
            this.$el.data("ItemType", this.model.webAPIModelName);
            this.$el.data("DropEvent", "itemMoved");

            var draggableOptions =
            {
                refreshPositions: true,
                appendTo: theMarsApp.getBodyElement(),
                helper: _.bind(this._makeHelper, this),
                start: _.bind(this._onDragStart, this),
                stop: _.bind(this._onDragStop, this),
                containment: "#calendarWrapper",
                addClasses: false
            };
            this.$el.draggable(draggableOptions);
        },

        _makeHelper: function()
        {
            var $helper = $("<div class='dragHelper'/>");
            $helper.append(this.$el.clone().width(this.$el.width()));
            return $helper;
        },

        _presetSelected: function()
        {
            if (this.model.selected)
            {
                this._onSelected();
            }
        },

        _select: function()
        {
            this.model.trigger("select", this.model);
        },

        _onDragStart: function(e, ui)
        {
            $(ui.helper).width(this.$el.width());
            this.dragging = true;
        },

        _onDragStop: function()
        {
            this.dragging = false;
        },

        _onSettingsClicked: function(e)
        {
            var offset = $(e.currentTarget).offset();
            var settingsView = new MetricTileSettingsView({ model: this.model });
            settingsView.render().bottom(offset.top + 12).center(offset.left - 4);
        },

        _onMouseup: function(e)
        {
            if (this.dragging)
            {
                e.preventDefault();
                return;
            }

            if (e)
            {
                if (e.button && e.button === 2)
                {
                    return;
                }

                if (e.isDefaultPrevented())
                {
                    return;
                }

                e.preventDefault();
            }

            this._select();
        },

        _onMousedown: function()
        {
            this._select();
        },

        _onSelected: function()
        {
            this.$el.addClass("selected");
        },

        _onUnselected: function()
        {
            this.$el.removeClass("selected");
        }

    });

    return CalendarMetricView;
});
