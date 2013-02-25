define(
[

    "underscore",
    "jqueryui/draggable",
    "jqueryui/droppable",
    "moment",

    "TP",
    "views/calendarWorkoutView",
    "hbs!templates/views/calendarDay"
],
function(_, draggable, droppable, moment, TP, CalendarWorkoutView, CalendarDayTemplate)
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
            this.collection = this.model.collection;
            this.on("after:item:added", this.makeDraggable, this);
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
            this.$el.droppable({ drop: this.onDropItem });
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
        }
    });
});