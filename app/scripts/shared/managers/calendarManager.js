define(
[
    "jquery",
    "underscore",
    "moment",
    "backbone",
    "TP",
    "shared/utilities/calendarUtility",
    "shared/utilities/collections/dateLikeCollection",
    "models/workoutsCollection",
    "shared/models/metricsCollection",
    "shared/models/activityModel",
    "models/calendar/calendarDay",
],
function(
    $,
    _,
    moment,
    Backbone,
    TP,
    CalendarUtility,
    DatelikeCollection,
    WorkoutsCollection,
    MetricsCollection,
    ActivityModel,
    CalendarDayModel
)
{

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

        this.first = null;
        this.last = null;

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

        ensureRange: function(a, b)
        {

            a = CalendarUtility.weekMomentForDate(a);
            b = CalendarUtility.weekMomentForDate(b);

            var first = _.min([a, b]);
            var last = _.max([a, b]);

            if(this.first === null || this.last === null)
            {
                this.first = first;
                this.last = last;
                this._createWeeks(this.first, this.last);
            }
            else
            {
                var firstBefore = first;
                var lastBefore = moment(this.first).subtract(1, "week");

                if(firstBefore <= lastBefore)
                {
                    this.first = first;
                    this._createWeeks(firstBefore, lastBefore);
                }

                var firstAfter = moment(this.last).add(1, "week");
                var lastAfter = last;

                if(firstAfter <= lastAfter)
                {
                    this.last = last;
                    this._createWeeks(firstAfter, lastAfter);
                }
            }

        },

        get: function(klass, id)
        {
            var item = this.activities.get(ActivityModel.getActivityId({ klass: klass, id: id}));
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
            if(_.isUndefined(end))
            {
                end = start;
            }

            this.ensureRange(start, end);

            var promises = _.map(CalendarUtility.weeksForRange(start, end), this._loadActivitiesForWeek, this);
            return $.when.apply($, promises);
        },

        _loadActivitiesForWeek: function(id)
        {

            var self = this;

            var week = this.weeks.get(id);

            if(week.getState().get("isFetched"))
            {
                return; // We've already loaded this week
            }

            week.getState().set({ isWaiting: true, isFetched: false, isFailed: false });

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
                    week.getState().set({ isWaiting: false, isFetched: true });
                });
            },
            function() // on error
            {
                week.getState().set({ isWaiting: false, isFailed: true });
            });

            return promise;

        },

        addItem: function(item)
        {
            item = ActivityModel.wrap(item);
            this.activities.add(item);
        },

        addOrUpdateItem: function(klass, modelData)
        {
            var activityId = ActivityModel.getActivityId({
                klass: klass,
                attributes: modelData
            });

            var existingActivity = this.activities.get(activityId);
            if(existingActivity)
            {
                var originalItem = existingActivity.unwrap();
                originalItem.set(modelData);
                return originalItem;
            }

            // no existing activity found, add to collection
            var newItem = new klass(modelData);
            this.addItem(newItem);
            return newItem;
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
                    week.getState().set({ isFetched: false });
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
