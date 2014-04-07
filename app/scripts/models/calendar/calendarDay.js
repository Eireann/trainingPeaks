﻿define(
[
    "underscore",
    "moment",
    "TP",
    "shared/models/activityModel",
    "shared/models/metricModel",
    "models/workoutModel"
],
function(_, moment, TP, ActivityModel, MetricModel, WorkoutModel)
{

    var CalendarDay = TP.Model.extend(
    {

        idAttribute: 'date',

        initialize: function(attrs, options)
        {
            this.options = options;
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
                    date = model.get("startTime") || model.get("startTimePlanned");
                    time = date ? date.replace(/.*T/, "") : null;
                    key = time;
                }
                else if(model instanceof MetricModel)
                {
                    date = model.get("timeStamp");
                    time = date ? date.replace(/.*T/, "") : null;
                    key = time;
                }
                else
                {
                    key = null;
                }

                return key;
            };

            this.listenTo(this.itemsCollection, "change:startTime change:startTimePlanned change:timeStamp", _.bind(this.itemsCollection.sort, this.itemsCollection));
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

        getItem: function(klass, id)
        {
            var item = this.itemsCollection.get([klass.prototype.webAPIModelName, id].join(":"));
            return ActivityModel.unwrap(item);
        },

        reset: function(models, options)
        {
            models = _.map(models, _.bind(ActivityModel.wrap, ActivityModel));
            this.itemsCollection.reset(models, options);
        },

        length: function()
        {
            return this.itemsCollection.length;
        },

        each: function(callback)
        {
            _.each(this.items(), callback);
        },

        items: function()
        {
            return this.itemsCollection.map(function(item) { return ActivityModel.unwrap(item); });
        },

        cloneForCut: function()
        {
            var clone = this.clone();
            clone.itemsCollection.set(this._filterItemsForCopyOrCut());
            return clone;
        },

        cloneForCopy: function()
        {
            var day = this.clone();
            _.each(this._filterItemsForCopyOrCut(), function(activity)
            {
                day.add(ActivityModel.unwrap(activity).cloneForCopy());
            });
            return day;
        },

        _filterItemsForCopyOrCut: function()
        {
            return this.itemsCollection.filter(function(model)
            {
                return !(ActivityModel.unwrap(model) instanceof MetricModel);
            });
        }
    });

    return CalendarDay;
});
