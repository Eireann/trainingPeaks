define(
[

    "underscore",
    "jqueryui/draggable",
    "jqueryui/droppable",
    "moment",
    "TP",
    "views/calendar/workout/calendarWorkoutView",
    "views/calendar/day/calendarDaySettings",
    "views/calendar/newItemView",
    "views/calendar/day/calendarDayDragStateView",
    "hbs!templates/views/calendar/day/calendarDayHeader",
    "hbs!templates/views/calendar/day/calendarDay"
],
function(_, draggable, droppable, moment, TP, CalendarWorkoutView, CalendarDaySettingsView, NewItemView, CalendarDayDragStateView, CalendarDayHeaderTemplate, CalendarDayTemplate)
{

    var today = moment().format(TP.utils.datetime.shortDateFormat);

    var CalendarDayHeaderView = TP.ItemView.extend(
    {
        template:
        {
            type: "handlebars",
            template: CalendarDayHeaderTemplate
        }
    });

    return TP.CompositeView.extend(
    {
        tagName: "div",
        className: "day",

        modelViews:
        {
            Label: CalendarDayHeaderView,
            Workout: CalendarWorkoutView
        },

        template:
        {
            type: "handlebars",
            template: CalendarDayTemplate
        },

        initialize: function()
        {
            if (theMarsApp)
                theMarsApp.user.on("change:settings", this.render, this);
            
            this.collection = this.model.itemsCollection;

            this.on("after:item:added", this.makeItemsDraggable, this);
            this.model.on("day:select", this.select, this);
            this.model.on("day:unselect", this.unselect, this);

            this.collection.on("select", this.onItemSelect, this);
        },

        events:
        {
            "mousedown .dayHeader": "onDayClicked",
            "mouseenter .dayHeader": "onDayHeaderMouseEnter",
            "mouseleave .dayHeader": "onDayHeaderMouseLeave",

            "click .dayHeader": "onDayClicked",

            "click .addWorkout": "onAddWorkoutClicked",
            "mousedown .daySettings": "daySettingsClicked",
            "click .daySelected": "onDayUnClicked"
        },

        getItemView: function(item)
        {
            if (!item)
            {
                return TP.ItemView;
            }

            var modelName = this.getModelName(item);
            if (!this.modelViews.hasOwnProperty(modelName))
            {
                throw "Item has no defined view in CalendarDayView: " + item;
            }
            return this.modelViews[modelName];
        },

        getModelName: function (item)
        {
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

        onBeforeRender: function()
        {
            this.model.configureDayLabel();
        },

        onRender: function()
        {
            this.setTodayCss();
            this.makeDayDraggable();
            this.setUpDroppable();
        },

        setTodayCss: function()
        {
            // so we can style today or scroll to it
            if (this.model.get("date") === today)
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
            _.bindAll(this, "onDropItem");
            this.$el.droppable({ drop: this.onDropItem, tolerance: 'pointer' });
        },

        onDropItem: function(event, ui)
        {
            var options = _.clone(ui.draggable.data());
            if (!options.hasOwnProperty("DropEvent") || !options.hasOwnProperty("ItemId") || !options.hasOwnProperty("ItemType"))
            {
                throw "CalendarDayView.onDropItem: ui.draggable should have DropEvent, ItemId, ItemType data attributes: " + options.toString();
            }
            options.destinationCalendarDayModel = this.model;
            this.trigger("itemDropped", options);
        },

        keepSettingsButtonVisible: function()
        {
            this.$el.addClass("menuOpen");
        },

        onDaySettingsClose: function(e)
        {
            this.allowSettingsButtonToHide(e);
            this.onDayUnClicked(e);
        },

        allowSettingsButtonToHide: function(e)
        {
            this.$el.removeClass("menuOpen");
        },

        daySettingsClicked: function (e)
        {
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

        onDayClicked: function(e)
        {
            if (e.isDefaultPrevented())
                return;

            e.preventDefault();

            this.model.trigger("day:click", this.model, e);
            this.select();
        },

        onAddWorkoutClicked: function(e)
        {

            /*if (theMarsApp.isBlurred || e.isDefaultPrevented())
                return;

            if (e.shiftKey)
                return;
                */

            this.allowSettingsButtonToHide();
            e.preventDefault();

            //this.model.trigger("day:click", this.model, e);

            this.model.trigger("day:selectAddItem");

            var newItemView = new NewItemView({ model: this.model });
            newItemView.render();

            this.selectAddWorkoutIcon();

            newItemView.on("close", this.unSelectAddWorkoutIcon, this);
            newItemView.on("openQuickView", this.onOpenQuickViewFromNewItem, this);
        },

        onOpenQuickViewFromNewItem: function(quickView)
        {
            this.selectAddWorkoutIcon();
            quickView.on("close", this.unSelectAddWorkoutIcon, this);
        },

        select: function(e)
        {
            this.selected = true;
            this.$el.addClass("selected");
        },

        unselect: function()
        {
            this.selected = false;
            this.$el.removeClass("selected");
        },

        makeDayDraggable: function()
        {
            _.bindAll(this, "draggableHelper", "onDragStart", "onDragStop");
            this.$el.data("ItemId", this.model.id);
            this.$el.data("ItemType", "CalendarDay");
            this.$el.data("DropEvent", "dayMoved");
            this.draggableOptions = { appendTo: theMarsApp.getBodyElement(), helper: this.draggableHelper, start: this.onDragStart, stop: this.onDragStop };
            this.$el.draggable(this.draggableOptions);
        },

        draggableHelper: function(e)
        {
            // get a day view, with all items in drag state
            var helperView = new CalendarDayDragStateView({ model: this.model });
            helperView.render();
            var $helperViewEl = helperView.$el;
            $helperViewEl.width(this.$el.width());
            //$helperViewEl.height(this.$el.height());

            // wrap it in a week of the appropriate class
            var $helperEl = $("<div></div>");
            $helperEl.attr("class", this.$el.closest(".week").attr("class"));
            $helperEl.append($helperViewEl);

            return $helperEl;
        },

        onDragStart: function(e)
        {
            this.$el.addClass("dragging");
        },

        onDragStop: function()
        {
            this.$el.removeClass("dragging");
        },
        appendHtml: function(collectionView, itemView, index)
        {
            itemView.$el.insertBefore(collectionView.$(".addWorkoutWrapper"));
        },

        onDayHeaderMouseEnter: function(e)
        {
            this.$el.addClass("hoveringOverDayHeader");
        },

        onDayHeaderMouseLeave: function(e)
        {
            this.$el.removeClass("hoveringOverDayHeader");
        },

        onDayUnClicked: function(e)
        {
            //this.unselect();
            //this.model.trigger("day:click", this.model, e);
            this.model.trigger("day:unselect", this.model, e);
        },

        onItemSelect: function()
        {
            this.unSelectAddWorkoutIcon();
        },

        unSelectAddWorkoutIcon: function()
        {
            this.$(".addWorkout").removeClass("active");
        },

        selectAddWorkoutIcon: function()
        {
            this.$(".addWorkout").addClass("active");
        }

    });
});