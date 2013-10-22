define(
[
    "underscore",
    "moment",
    "TP",
    "shared/utilities/calendarUtility",
    "models/workoutsCollection",
    "shared/models/metricsCollection",
    "shared/models/activityModel",
    "models/calendar/calendarDay",
],
function(
    _,
    moment,
    TP,
    CalendarUtility,
    WorkoutsCollection,
    MetricsCollection,
    ActivityModel,
    CalendarDayModel
)
{

    var DatelikeCollection = TP.Collection.extend(
    {
        
        initialize: function(models, options)
        {
            this.manager = options.manager;
            this.datelike = options.datelike;
        },

        get: function(id)
        {
            this.manager.ensure(id);
            return this.constructor.__super__.get.apply(this, arguments);
        },

        prepareNext: function(count)
        {
            var length = this.length;

            var last = moment(this.last().id).add(count, this.datelike);
            this.manager.ensure(last);

            return this.slice(length, length + count);
        },

        preparePrevious: function(count)
        {
            var length = this.length;

            var first = moment(this.first().id).subtract(count, this.datelike);
            this.manager.ensure(first);

            var change = this.length - length;

            return this.slice(change - count, change);
        }

    });

    function CalendarManager(options)
    {

        if(!options.dataManager)
        {
            throw new Error("CalendarManager requires a dataManager");
        }

        this.dataManager = options.dataManager;

        this.activities = new TP.Collection([], { manager: this });
        this.days = new DatelikeCollection([], { manager: this, datelike: "day", model: CalendarDayModel, comparator: "date" });
        this.weeks = new DatelikeCollection([], { manager: this, datelike: "week", comparator: "id" });

        this.begin = CalendarUtility.weekMomentForDate(moment());
        this.end = CalendarUtility.weekMomentForDate(moment());

        this.listenTo(this.activities, "request sync error add change:workoutDay change:timeStamp", _.bind(this._indexActivityByDay, this));
        this.listenTo(this.activities, "remove", _.bind(this._unindexActivityByDay, this));

        this.listenTo(theMarsApp.user, "athlete:change", _.bind(this.reset, this));

    }

    _.extend(CalendarManager.prototype, Backbone.Events);

    _.extend(CalendarManager.prototype,
    {

        ensure: function(date)
        {
            this.ensureRange(date, date);
        },

        ensureRange: function(start, end)
        {

            start = moment(start);
            end = moment(end);

            var beforeFirst = _.min([start, end, this.begin]);
            var beforeLast = this.begin;
            var afterFirst = this.end;
            var afterLast = _.max([start, end, moment(this.end).subtract(1, "week")]);

            this.begin = CalendarUtility.weekMomentForDate(beforeFirst);
            this.end = CalendarUtility.weekMomentForDate(afterLast).add(1, "week");

            if(beforeFirst < beforeLast)
            {
                this._createWeeks(beforeFirst, beforeLast);
            }

            if(afterFirst < afterLast)
            {
                this._createWeeks(afterFirst, afterLast);
            }

        },

        get: function(id, model)
        {
            var item = this.activities.get([model.webAPIModelName, id].join(":"));
            return ActivityModel.unwrap(item);
        },

        _createWeeks: function(start, end, index)
        {

            var days = [];
            var weeks = [];

            _.each(CalendarUtility.weeksForRange(start, end), function(date)
            {
                var WeekModel = this.weeks.model;
                var DayModel = this.days.model;

                var daysCollection = new TP.Collection();

                var week = new WeekModel({ id: date, days: daysCollection, week: daysCollection });
                weeks.push(week);

                for(var i = 0; i < 7; i++)
                {
                    var day = new DayModel({ date: moment(date).add(i, "days").format(CalendarUtility.idFormat) });
                    daysCollection.add(day);
                    days.push(day);
                }

            }, this);

            this.days.add(days);
            this.weeks.add(weeks);

            return weeks;

        },

        aroundChanges: function(callback, context)
        {
            this.weeks.trigger("before:changes");
            this.days.trigger("before:changes");
            try
            {
                callback.call(context);
            }
            finally
            {
                this.days.trigger("after:changes");
                this.weeks.trigger("after:changes");
            }
        },

        loadActivities: function(start, end)
        {
            this.ensureRange(start, end);

            var promises = _.map(CalendarUtility.weeksForRange(start, end), this._loadActivitiesForWeek, this);
            return $.when.apply($, promises);
        },

        _loadActivitiesForWeek: function(id)
        {

            var self = this;

            var week = this.weeks.get(id);

            if(week.get("isFetched"))
            {
                return; // We've already loaded this week
            }

            week.set({ isWaiting: true });

            var startDate = CalendarUtility.startMomentOfWeek(id);
            var endDate = CalendarUtility.endMomentOfWeek(id);

            var workoutsPromise = this.dataManager.loadCollection(WorkoutsCollection, {
                startDate: moment(startDate),
                endDate: moment(endDate)
            });
            var workouts = workoutsPromise.collection;

            var metricsPromise = this.dataManager.loadCollection(MetricsCollection, {
                startDate: moment(startDate),
                endDate: moment(endDate)
            });
            var metrics = metricsPromise.collection;
            
            var promise = $.when(workoutsPromise, metricsPromise);

            promise.then(function()
            {
                self.aroundChanges(function()
                {
                    workouts.each(self.addItem, self);
                    metrics.each(self.addItem, self);
                    week.set({ isWaiting: false, isFetched: true });
                });
            },
            function() // on error
            {
                week.set({ isWaiting: false, isFailed: true });
            });

            return promise;

        },

        addItem: function(item)
        {
            item = ActivityModel.wrap(item);
            this.activities.add(item);
        },

        _indexActivityByDay: function(activity)
        {
            var oldDay, newDay;
            if(activity.dayCollection)
            {
                oldDay = activity.dayCollection;
            }

            var activityDay = activity.getCalendarDay();
            if (activityDay)
            {
                var dayId = moment(activityDay).format(CalendarUtility.idFormat);
                newDay = this.days.get(dayId);
            }

            if(oldDay !== newDay)
            {
                if (oldDay) oldDay.remove(activity);
                if (newDay) newDay.add(activity);
                activity.dayCollection = newDay;
            }
        },

        _unindexActivityByDay: function(activity)
        {
            if(activity.dayCollection)
            {
                activity.dayCollection.remove(activity);
                activity.dayCollection = null;
            }
        },

        reset: function()
        {
            var self = this;
            this.aroundChanges(function()
            {
                self.dataManager.forceReset(); // TODO: Limit Reset?
                self.activities.set([]);

                self.weeks.each(function(week)
                {
                    week.set({ isFetched: false, isWaiting: true });
                });

                self.trigger("refresh");
                self.activities.trigger("refresh");
                self.weeks.trigger("refresh");
                self.days.trigger("refresh");
            });
        }

    });

    return CalendarManager;

});
