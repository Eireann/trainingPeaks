define(
[
    "jquery",
    "underscore",
    "moment",
    "TP",
    "calendar/views/metricTileSettingsView",
    "quickview/metric/views/metricQuickView",
    "hbs!calendar/templates/metricTileTemplate"
],
function(
    $,
    _,
    moment,
    TP,
    MetricTileSettingsView,
    MetricQuickView,
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
            "mouseup .metricSettings": "_onSettingsClicked",
            "mouseup": "_onMouseup",
            "mousedown": "_onMousedown"
        },

        modelEvents:
        {
            "change": "render",
            "state:change:isSelected": "_updateSelected"
        },

        initialize: function(options)
        {
            this.on("render", this._setupDraggable, this);
            this.on("render", this._updateSelected, this);

            var user = options.user || theMarsApp.user;
            this.listenTo(user, "change:units", _.bind(this.render, this));
            this.userSettingsMetricOrder = options.userSettingsMetricOrder || _.pluck(theMarsApp.user.getMetricsSettings().get("metricTypes"), "type");
        },

        serializeData: function()
        {
            var data = this.model.toJSON();
            data.keyStat = this.model.getKeyStatField(this.userSettingsMetricOrder);

            if(data.details.length > 1)
            {
                data.hiddenStatsCount = data.details.length - 1;
            }
            
            return data;
        },

        onRender: function()
        {
            this._hideTimeIfTwelveAM();
        },

        _hideTimeIfTwelveAM: function()
        {
            var twelveAM = moment(this.model.getCalendarDay()).startOf("day");
            if(!moment(this.model.getTimestamp()).diff(twelveAM))
            {
                this.$(".metricTimeWrapper").remove();
            }
        },

        _updateSelected: function()
        {
            this.$el.toggleClass("selected", this.model.getState().get("isSelected") || false);
        },

        _setupDraggable: function()
        {
            var draggableOptions =
            {
                refreshPositions: true,
                appendTo: theMarsApp.getBodyElement(),
                helper: _.bind(this._makeHelper, this),
                start: _.bind(this._onDragStart, this),
                stop: _.bind(this._onDragStop, this),
                addClasses: false
            };
            this.$el.draggable(draggableOptions).data({ handler: this.model });
        },

        _makeHelper: function()
        {
            var $helper = $("<div class='dragHelper'/>");
            $helper.append(this.$el.clone().width(this.$el.width()));
            return $helper;
        },

        _select: function(e)
        {
            theMarsApp.selectionManager.setSelection(this.model, e);
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

        _keepSettingsButtonVisible: function()
        {
            this.$el.addClass("menuOpen");
        },

        _allowSettingsButtonToHide: function(e)
        {
            this.$el.removeClass("menuOpen");
        },

        _onSettingsClicked: function(e)
        {
            var offset = $(e.currentTarget).offset();
            var settingsView = new MetricTileSettingsView({ model: this.model });
            settingsView.render().bottom(offset.top + 12).center(offset.left - 4);

            e.preventDefault();

            this._keepSettingsButtonVisible();
            this.listenTo(settingsView, "close", _.bind(this._allowSettingsButtonToHide, this));
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

            this._allowSettingsButtonToHide();

            this._select(e);

            var view = new MetricQuickView({ model: this.model });
            view.render();
        },

        _onMousedown: function(e)
        {
            this._select(e);
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
