define(
[
    "jquery",
    "underscore",
    "jqueryui/touch-punch",
    "jqueryui/draggable",
    "jqueryui/droppable",
    "moment",
    "setImmediate",
    "TP",
    "shared/models/activityModel",
    "models/calendar/calendarDay",
    "views/calendar/workout/calendarWorkoutView",
    "calendar/views/metricTileView",
    "views/calendar/day/calendarDaySettings",
    "views/calendar/newItemView",
    "views/calendar/moveItems/selectedRangeSettings",
    "hbs!templates/views/calendar/day/calendarDay"
],
function(
    $,
    _,
    touchPunch,
    draggable,
    droppable,
    moment,
    setImmediate,
    TP,
    ActivityModel,
    CalendarDayModel,
    CalendarWorkoutView,
    MetricTileView,
    CalendarDaySettingsView,
    NewItemView,
    SelectedRangeSettingsView,
    CalendarDayTemplate
)
{

    return TP.CompositeView.extend(
    {
        tagName: "div",
        className: "day",

        modelViews:
        {
            Workout: CalendarWorkoutView,
            Metric: MetricTileView
        },

        template:
        {
            type: "handlebars",
            template: CalendarDayTemplate
        },

        itemViewContainer: ".activities",

        initialize: function(options)
        {
            if (theMarsApp)
            {
                this.listenTo(theMarsApp.user, "change:settings", _.bind(this.render, this));
            }

            this.collection = this.model.itemsCollection;

            this.on("after:item:added", this.makeItemsDraggable, this);
            this.listenTo(this.model, "state:change:isSelected", _.bind(this._updateSelected, this));

            this.listenTo(this.collection, "sort", _.bind(this.onItemSort, this));

            this._refreshOnUserDateFormatChangeIfNecessary();
        },

        events:
        {
            "mousedown .dayHeader": "onDayHeaderClicked",
            "mouseenter .dayHeader": "onDayHeaderMouseEnter",
            "mouseleave .dayHeader": "onDayHeaderMouseLeave",

            "click .daySelected": "onSelectedClicked",

            "click .addWorkout": "onAddWorkoutClicked",
            "mouseup": "onDayClicked",
            "mousedown .daySettings": "daySettingsClicked",
            "click": "onDayTouched"
        },

        onSelectedClicked: function(event)
        {
            // pointer-events: none; should prevent the from being called, but IE10 doesn't support pointer-events
            this._getSelectionManager().clearSelection();
        },

        onItemSort: function()
        {
            var self = this;
            this.collection.each(function(item, index)
            {
                var view = self.children.findByModel(item);
                self.appendHtml(self, view, index);
            });
        },

        getItemView: function(item)
        {
            var self = this;
            item = ActivityModel.unwrap(item);
            if (!item)
            {
                return TP.ItemView;
            }

            var modelName = this.getModelName(item);
            if (!this.modelViews.hasOwnProperty(modelName))
            {
                throw "Item has no defined view in CalendarDayView: " + item;
            }
            return function(options) {
                var klass = self.modelViews[modelName];
                // Use the unwrapped model to instantiate the view
                options.model = item;
                return new klass(options);
            };
        },

        getModelName: function (item)
        {
            item = ActivityModel.unwrap(item);
            if (item.isDateLabel)
                return "Label";
            else if (typeof item.webAPIModelName !== 'undefined')
                return item.webAPIModelName;
            else
                return null;
        },

        attributes: function ()
        {
            return {
                "data-date": this.model.id
            };
        },

        onRender: function()
        {
            this.setTodayCss();
            this.makeDayDraggable();
            setImmediate(_.bind(this.setUpDroppable, this));
        },

        setTodayCss: function()
        {
            // so we can style today or scroll to it
            if (TP.utils.datetime.isToday(this.model.get("date")))
            {
                this.$el.addClass("today");
            }
        },

        makeItemsDraggable: function(childView)
        {
            var modelName = this.getModelName(childView.model);
            if (modelName !== "Label" && typeof childView.makeDraggable === 'function')
            {
                childView.makeDraggable();
            }
        },

        setUpDroppable: function()
        {
            this.$el.droppable({ drop: _.bind(this._onDropItem, this), tolerance: 'pointer' });
        },

        _onDropItem: function(event, ui)
        {
            var handler = ui.draggable.data("handler");

            if(handler)
            {
                if(handler instanceof CalendarDayModel)
                {
                    this._getActivityMover().dropActivitiesOnDay(handler.items(), this.model.id);
                    this._getSelectionManager().setSelection(this.model);
                }
                else
                {
                    this._getActivityMover().dropActivityOnDay(handler, this.model.id);
                }
            }
            else
            {
                console.warn("No handler available on draggable");
            }
        },

        keepSettingsButtonVisible: function()
        {
            this.$el.addClass("menuOpen");
        },

        onDaySettingsClose: function(e)
        {
            this.allowSettingsButtonToHide(e);
        },

        allowSettingsButtonToHide: function(e)
        {
            this.$el.removeClass("menuOpen");
        },

        daySettingsClicked: function(e)
        {
            if (e && e.button && e.button === 2)
            {
                return;
            }

            if (e.shiftKey)
                return;

            this.keepSettingsButtonVisible();
            e.preventDefault();

            var offset = $(e.currentTarget).offset();
            this.daySettings = new CalendarDaySettingsView({ model: this.model, parentEl: this.$el });
            this.daySettings.render().center(offset.left + 10).bottom(offset.top + 15);
            this.daySettings.once("close", this.onDaySettingsClose, this);
            this.daySettings.once("add", this.onAddWorkoutClicked, this);
            this.daySettings.once("beforeShift", function()
            {
                this.daySettings.off("close", this.onDaySettingsClose, this);
                this.allowSettingsButtonToHide(e);
            }, this);
            this.model.trigger("day:click", this.model, e);
        },

        onDayHeaderClicked: function(e)
        {
            this._doSelect(e);
        },

        onDaySelectedClicked: function(e)
        {
            this._doSelect(e);
        },

        _doSelect: function(e)
        {
            e.preventDefault();
            this._getSelectionManager().setSelection(this.model, e);

            if(this._getSelectionManager().selection.length > 1)
            {
                var rangeSettingsView = new SelectedRangeSettingsView();
                rangeSettingsView.render().left(e.pageX - 30).bottom(e.pageY);
            }
        },

        onAddWorkoutClicked: function(e)
        {
            this.allowSettingsButtonToHide();
            e.preventDefault();
            this.openNewItemViewIfAuthorized();
        },

        onDayClicked: function(e)
        {
            if (this.$el.hasClass("selected"))
            {
                return;
            }

            if(e.isDefaultPrevented())
            {
                return;
            }

            if (theMarsApp.isTouchEnabled() && this.$el.hasClass("menuOpen"))
            {
                return;
            }
        },

        openNewItemViewIfAuthorized: function()
        {
            theMarsApp.featureAuthorizer.runCallbackOrShowUpgradeMessage(
                theMarsApp.featureAuthorizer.features.SaveWorkoutToDate, 
                _.bind(this.openNewItemView, this),
                {targetDate: this.model.get("date")}
            );
        },

        openNewItemView: function()
        {
            var newItemView = new NewItemView({ model: this.model });
            newItemView.render();

            this._selectAddWorkoutIcon();

            this.listenTo(newItemView, "close", _.bind(this._unselectAddWorkoutIcon, this));
            this.listenTo(newItemView, "openQuickView", _.bind(this.onOpenQuickViewFromNewItem, this));

            TP.analytics("send", { "hitType": "event", "eventCategory": "calendar", "eventAction": "newWorkout", "eventLabel": "" });
        },

        onOpenQuickViewFromNewItem: function(quickView)
        {
            this._selectAddWorkoutIcon();
            this.listenTo(quickView, "close", _.bind(this._unselectAddWorkoutIcon, this));
        },

        _updateSelected: function()
        {
            this.$el.toggleClass("selected", this.model.getState().get("isSelected") || false);
        },

        makeDayDraggable: function()
        {
            _.bindAll(this, "onDragStart", "onDragStop");
            this.draggableOptions = 
            this.$el.draggable(
            {
                refreshPositions: true,
                appendTo: theMarsApp.getBodyElement(),
                helper: _.bind(this._makeHelper, this),
                handle: ".dayHeader, .daySelected",
                start: this.onDragStart,
                stop: this.onDragStop
            }).data({ handler: this.model });
        },

        _makeHelper: function()
        {
            var $helper = $("<div class='dragHelper'/>");
            $helper.append(this.$el.clone().width(this.$el.width()));
            return $helper;
        },

        onDragStart: function(e, ui)
        {
            this.$el.addClass("dragging");
            TP.analytics("send", { "hitType": "event", "eventCategory": "calendar", "eventAction": "dragDropStart", "eventLabel": "day" });
        },

        onDragStop: function()
        {
            this.$el.removeClass("dragging");
        },

        onDayHeaderMouseEnter: function(e)
        {
            this.$el.addClass("hoveringOverDayHeader");
        },

        onDayHeaderMouseLeave: function(e)
        {
            this.$el.removeClass("hoveringOverDayHeader");
        },

        onDayTouched: function(e)
        {
            if(e.isDefaultPrevented())
            {
                return;
            }

            if (this.$el.hasClass("menuOpen"))
            {
                return;
            }

            if (theMarsApp.isTouchEnabled() && !$(e.target).is(".dayHeader"))
            {
                this.openNewItemViewIfAuthorized(e);
            }
        },

        _refreshOnUserDateFormatChangeIfNecessary: function()
        {
            if(moment(this.model.get("date")).date() === 1)
            {
                this.listenTo(theMarsApp.user, "change:dateFormat", _.bind(this.render, this));
            }
        },

        _selectAddWorkoutIcon: function()
        {
            this.$(".addWorkout").addClass("active");
        },

        _unselectAddWorkoutIcon: function()
        {
            this.$(".addWorkout").removeClass("active");
        },

        _getActivityMover: function()
        {
            return this.options && this. options.activityMover ? this.options.activityMover : theMarsApp.activityMover;
        },

        _getSelectionManager: function()
        {
            return this.options && this.options.selectionManager ? this.options.selectionManager : theMarsApp.selectionManager;
        }

    });
});
