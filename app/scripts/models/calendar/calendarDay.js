define(
[
    "underscore",
    "moment",
    "TP",
    "models/workoutModel",
    "models/selectedWorkoutCollection"
],
function(_, moment, TP, WorkoutModel, SelectedWorkoutCollection)
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

        // gets called via onBeforeRender of calendarDayView - only add a label if we need it for render,
        // but not for copy/paste etc
        configureDayLabel: function(forceAdd)
        {
            if (forceAdd || !this.hasLabel)
            {
                // add a model to hold our label
                var dayLabel = new TP.Model({ date: this.get("date") });
                dayLabel.isDateLabel = true;
                this.itemsCollection.unshift(dayLabel);
                this.hasLabel = true;
            }
        },

        add: function(item, noParentReference)
        {
            this.itemsCollection.add(item);
        },

        remove: function(item)
        {
            this.itemsCollection.remove(item);
        },

        reset: function(models, options)
        {
            this.itemsCollection.reset(models, options);
            this.configureDayLabel(true);
        },

        //deleteDayItems: function()
        //{
        //    this.itemsCollection.each(function(item)
        //    {
        //        if (!item.isDateLabel)
        //            item.destroy({ wait: true });
        //    });
        //},
        
        deleteDayItems: function()
        {
            var workoutItems = this.getWorkoutItems();
            var selectedWorkoutcollection = new SelectedWorkoutCollection(workoutItems);
            selectedWorkoutcollection.deleteSelectedWorkouts();
        },
        
        getWorkoutItems: function()
        {
            var workoutsList = [];
            this.itemsCollection.each(function (item)
            {
                if (item instanceof WorkoutModel)
                    workoutsList.push(item);
            });
            return workoutsList;
        },

        copyToClipboard: function()
        {
            var calendarDay = new CalendarDay({ date: this.get("date") });
            this.itemsCollection.each(function(item)
            {
                if (typeof item.copyToClipboard === "function")
                    calendarDay.add(item.copyToClipboard());
            });
            return calendarDay;
        },

        cutToClipboard: function()
        {
            var calendarDay = new CalendarDay({ date: this.get("date") });
            this.itemsCollection.each(function(item)
            {
                if (typeof item.cutToClipboard === "function")
                    calendarDay.add(item.cutToClipboard());
            });
            return calendarDay;
        },

        onPaste: function(dateToPasteTo)
        {
            var pastedItems = [];
            this.itemsCollection.each(function(item)
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
        }
    }, { hasLabel: false });

    return CalendarDay;
});