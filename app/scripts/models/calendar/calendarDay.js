define(
[
    "underscore",
    "moment",
    "TP",
    "shared/models/activityModel",
    "shared/models/metricModel",
    "shared/models/selectedActivitiesCollection",
    "models/workoutModel"
],
function(_, moment, TP, ActivityModel, MetricModel, SelectedActivitiesCollection, WorkoutModel)
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
            this.itemsCollection.comparator = function(model)
            {
                model = ActivityModel.unwrap(model);

                var key, date, time;

                if(model instanceof WorkoutModel)
                {
                    date = model.get("startTime");
                    time = date ? date.replace(/.*T/, "") : null;
                    key = [1, time];
                }
                else if(model instanceof MetricModel)
                {
                    date = model.get("timeStamp");
                    time = date ? date.replace(/.*T/, "") : null;
                    key = [2, time];
                }
                else
                {
                    key = [99];
                }

                return key;
            };
            this.itemsCollection.on("change:startTime change:timeStamp", this.itemsCollection.sort, this.itemsCollection);
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
            this.each(function (item)
            {
                item = ActivityModel.unwrap(item);
                if (item instanceof WorkoutModel)
                    workoutsList.push(item);
            });
            return workoutsList;
        },

        length: function()
        {
            return this.itemsCollection.length;
        },

        workoutAdded: function(newWorkout)
        {
            this.trigger("workout:added", newWorkout);
        },

        each: function(callback)
        {
            _.each(this.items(), callback);
        },

        items: function()
        {
            return this.itemsCollection.map(function(item) { return ActivityModel.unwrap(item) });
        },

        getItems: function()
        {
            return this.itemsCollection.filter(function(model){
                return !model.isDateLabel;
            });
        },

        moveItemsToDay: function(date)
        {
            this.each(function(activity)
            {
                if(_.isFunction(activity.moveToDay))
                {
                    activity.moveToDay(date);
                }
            });
        },

        dropped: function(options)
        {
            if(options.date)
            {
                if(options.date === this.id)
                {
                    return;
                }

                this.moveItemsToDay(options.date);
            }
        },

        pasted: function(options)
        {
            if(options.date)
            {
                if(options.date === this.id)
                {
                    return;
                }

                this.moveItemsToDay(options.date);
            }
        }

    }, { hasLabel: false });

    return CalendarDay;
});
