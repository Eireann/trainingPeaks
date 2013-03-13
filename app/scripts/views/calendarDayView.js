define(
[

    "underscore",
    "jqueryui/draggable",
    "jqueryui/droppable",
    "moment",

    "TP",
    "views/calendarWorkoutView",
    "views/calendarDaySettings",
    "hbs!templates/views/calendarDay"
],
function(_, draggable, droppable, moment, TP, CalendarWorkoutView, CalendarDaySettingsView, CalendarDayTemplate)
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
            
            this.on("after:item:added", this.makeDraggable, this);
            this.model.on("day:select", this.select, this);
            this.model.on("day:unselect", this.unselect, this);
        },

        events:
        {
            mouseenter: "onMouseEnter",
            mouseleave: "onMouseLeave",
            "click": "onDayClicked",

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

        makeDraggable: function(childView)
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

        onMouseLeave: function (e)
        {
            var toElement = document.elementFromPoint(e.pageX, e.pageY);
            if (e.toElement === this.el)
                return;

            this.removeSettingsButton(e);
        },

        showSettingsButton: function ()
        {
            this.$(".daySettings").css('display', "block");
        },

        removeSettingsButton: function (e)
        {
            var toElement = $(document.elementFromPoint(e.pageX, e.pageY));
            if (!toElement.is(".daySettings") && !toElement.is("#daySettingsDiv") && !toElement.is(".hoverBox"))
                this.$(".daySettings").css('display', "none");
        },

        daySettingsClicked: function (e)
        {
            e.preventDefault();

            var offset = $(e.currentTarget).offset();
            this.daySettings = new CalendarDaySettingsView({ model: this.model, top: offset.top + 10, left: offset.left + 5, parentEl:this.$el });
            this.daySettings.render();
            this.daySettings.on("mouseleave", this.onMouseLeave, this);
            this.$(".daySelected").css("display", "block");
            this.model.trigger("day:click", this.model, e);
        },

        onDayClicked: function(e)
        {
            if (e.isDefaultPrevented())
                return;

            this.model.trigger("day:click", this.model, e);
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
        }
    });
});