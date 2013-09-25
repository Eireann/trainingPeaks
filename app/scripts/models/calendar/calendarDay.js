define(
[
    "underscore",
    "moment",
    "TP",
    "shared/models/activityModel",
    "shared/models/selectedActivitiesCollection",
    "models/workoutModel"
],
function(_, moment, TP, ActivityModel, SelectedActivitiesCollection, WorkoutModel)
{

    var CalendarDay = TP.Model.extend(
    {
        idAttribute: 'date',

        initialize: function()
        {
            this.configureDate();
            this.configureCollection();
        },

        configureDate: function()
        {
            // we need a date
            var date = this.get("date");
            if (!date)
                throw new Error("CalendarDay requires a date");

            // use a formatted string for date attribute and for calendar id
            this.set("date", moment(date).format(TP.utils.datetime.shortDateFormat), { silent: true });
        },

        configureCollection: function()
        {
            // empty collection to store our collection
            this.itemsCollection = new TP.Collection();
        },


        add: function(item, noParentReference)
        {
            item = ActivityModel.wrap(item);
            this.itemsCollection.add(item);
        },

        remove: function(item)
        {
            item = ActivityModel.wrap(item);
            this.itemsCollection.remove(item);
        },

        reset: function(models, options)
        {
            this.itemsCollection.reset(models, options);
        },
        
        deleteDayItems: function()
        {
            var selectedActivitiesCollection = new SelectedActivitiesCollection(this.getItems());
            selectedActivitiesCollection.deleteSelectedItems();
        },
        
        getWorkoutItems: function()
        {
            var workoutsList = [];
            this.eachItem(function (item)
            {
                item = ActivityModel.unwrap(item);
                if (item instanceof WorkoutModel)
                    workoutsList.push(item);
            });
            return workoutsList;
        },

        copyToClipboard: function()
        {
            var calendarDay = new CalendarDay({ date: this.get("date") });
            this.eachItem(function(item)
            {
                if (typeof item.copyToClipboard === "function")
                    calendarDay.add(item.copyToClipboard());
            });
            return calendarDay;
        },

        cutToClipboard: function()
        {
            var calendarDay = new CalendarDay({ date: this.get("date") });
            this.eachItem(function(item)
            {
                if (typeof item.cutToClipboard === "function")
                    calendarDay.add(item.cutToClipboard());
            });
            return calendarDay;
        },

        onPaste: function(dateToPasteTo)
        {
            var pastedItems = [];
            this.eachItem(function(item)
            {
                if (typeof item.onPaste === "function")
                {
                    pastedItems.push(item.onPaste(dateToPasteTo));
                }
            });
            return pastedItems;
        },

        length: function()
        {
            return this.itemsCollection.length;
        },

        workoutAdded: function(newWorkout)
        {
            this.trigger("workout:added", newWorkout);
        },

        eachItem: function(callback)
        {
            this.itemsCollection.each(function(item)
            {
                callback(ActivityModel.unwrap(item));
            });
        },

        getItems: function()
        {
            return this.itemsCollection.filter(function(model){
                return !model.isDateLabel;
            });
        }

    }, { hasLabel: false });

    return CalendarDay;
});
