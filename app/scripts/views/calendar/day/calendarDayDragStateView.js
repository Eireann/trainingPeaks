define(
[
    "moment",
    "TP",
    "shared/models/activityModel",
    "views/calendar/workout/calendarWorkoutDragStateView",
    "hbs!templates/views/calendar/day/calendarDayDragState"
],
function(moment, TP, ActivityModel, CalendarWorkoutDragStateView, CalendarDayTemplate)
{

    var today = moment().format(TP.utils.datetime.shortDateFormat);

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
        className: "day dragHelper",

        modelViews:
        {
            Label: CalendarDayLabelView,
            Workout: CalendarWorkoutDragStateView,
            Metric: TP.ItemView
        },

        initialize: function()
        {
            if (theMarsApp)
                theMarsApp.user.on("change", this.render, this);
            
            this.collection = this.model.itemsCollection;
        },

        getItemView: function(item)
        {
            item = ActivityModel.unwrap(item);
            var modelName = this.getModelName(item);
            if (!this.modelViews.hasOwnProperty(modelName))
            {
                throw "Item has no defined view in CalendarDayView: " + item;
            }
            return this.modelViews[modelName];
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
        },

        setTodayCss: function()
        {
            // so we can style today or scroll to it
            if (this.model.get("date") === today)
            {
                this.$el.addClass("today");
            }
        }

    });
});
