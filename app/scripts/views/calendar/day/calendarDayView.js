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
    "hbs!templates/views/calendar/day/calendarDay"
],
function(_, draggable, droppable, moment, TP, CalendarWorkoutView, CalendarDaySettingsView, NewItemView, CalendarDayDragStateView, CalendarDayTemplate)
{

    var today = moment().format("YYYY-MM-DD");

    var CalendarDayLabelView = TP.ItemView.extend(
    {
        template:
        {
            type: "handlebars",
            template: CalendarDayTemplate
        }
    });

    return TP.CollectionView.extend(
    {
        tagName: "div",
        className: "day",

        modelViews:
        {
            Label: CalendarDayLabelView,
            Workout: CalendarWorkoutView
        },

        initialize: function()
        {
            if (theMarsApp)
                theMarsApp.user.on("change", this.render, this);
            
            this.collection = this.model.itemsCollection;

            this.on("after:item:added", this.makeItemsDraggable, this);
            this.model.on("day:select", this.select, this);
            this.model.on("day:unselect", this.unselect, this);
        },

        events:
        {
            mouseenter: "onMouseEnter",
            mouseleave: "onMouseLeave",
            "mousedown .dayHeader": "onDayClicked",
            "click .dayHeader": "onDayClicked",

            "click": "onWhitespaceDayClicked",
            "click .daySettings": "daySettingsClicked"
        },

        getItemView: function(item)
        {
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

        onMouseEnter: function(e)
        {
            this.showSettingsButton(e);
        },

        onMouseLeave: function(e)
        {
            if (e.toElement === this.el)
                return;

            this.removeSettingsButton(e);
        },

        showSettingsButton: function ()
        {
            this.$(".daySettings").css('display', "block");
        },

        removeSettingsButton: function(e)
        {
            if (!e)
            {
                this.$(".daySettings").css('display', "none");
                return;
            }

            var toElement = $(document.elementFromPoint(e.pageX, e.pageY));
            if (!toElement.is(".daySettings") && !toElement.is("#daySettingsDiv") && !toElement.is(".hoverBox") && !toElement.is(".modal") && !toElement.is(".modalOverlay"))
                this.$(".daySettings").css('display', "none");
        },

        daySettingsClicked: function (e)
        {
            if (e.shiftKey)
                return;

            e.preventDefault();

            var offset = $(e.currentTarget).offset();
            this.daySettings = new CalendarDaySettingsView({ model: this.model, parentEl: this.$el });
            this.daySettings.render().center(offset.left + 10).bottom(offset.top + 10);
            this.daySettings.on("close", this.removeSettingsButton, this);
            this.$(".daySelected").css("display", "block");
            this.model.trigger("day:click", this.model, e);
        },

        onDayClicked: function(e)
        {
            if (e.isDefaultPrevented())
                return;

            e.preventDefault();

            this.model.trigger("day:click", this.model, e);
        },
        
        onWhitespaceDayClicked: function(e)
        {

            if (theMarsApp.isBlurred || e.isDefaultPrevented())
                return;

            if (e.shiftKey)
                return;

            e.preventDefault();

            this.model.trigger("day:click", this.model, e);

            var newItemView = new NewItemView({ model: this.model });
            newItemView.render();
        },

        select: function()
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
            this.draggableOptions = { appendTo: 'body', helper: this.draggableHelper, start: this.onDragStart, stop: this.onDragStop };
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
        }

    });
});