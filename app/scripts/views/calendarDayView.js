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

    var today = moment();

    var CalendarDayLabelView = TP.ItemView.extend({
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

        modelViews: {
            Label: CalendarDayLabelView,
            Workout: CalendarWorkoutView
        },

        initialize: function()
        {
            _.bindAll(this);
            this.collection = this.model.collection;
            this.on("after:item:added", this.makeDraggable);
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

        getModelName: function(item) {
            if (item.isDateLabel)
                return "Label";
            else if (typeof item.webAPIModelName !== 'undefined')
                return item.webAPIModelName;
            else
                return null;
        },

        attributes: function()
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
            var daysAgo = this.model.get("date").diff(today, "days");
            if (daysAgo === 0)
            {
                this.$el.addClass("today");
            }
        },

        makeDraggable: function(childView)
        {
            var modelName = this.getModelName(childView.model);
            if (modelName !== "Label")
            {
                childView.$el.data("ItemId", childView.model.id);
                childView.$el.draggable({ appendTo: 'body', helper: 'clone', opacity: 0.7 });
            }
        },

        setUpDroppable: function()
        {
            this.$el.droppable({ drop: this.onDropItem });
        },

        onDropItem: function(event, ui)
        {
            this.trigger("itemMoved", { itemId: ui.draggable.data("ItemId"), destinationCalendarDayModel: this.model });
        }

    });
});