﻿define(
[
    "underscore",
    "setImmediate",
    "TP",
    "moment",
    "models/activityCollection",
    "models/workoutModel",
    "views/workout/workoutBarView",
    "views/dayBarView",
    "views/home/scrollableColumnLayout",
    "views/scrollableCollectionView"
],
function(
    _,
    setImmediate,
    TP,
    moment,
    ActivityCollection,
    WorkoutModel,
    WorkoutBarView,
    DayBarView,
    ScrollableColumnLayout,
    ScrollableCollectionView,
    activityTemplate
    )
{
    return ScrollableColumnLayout.extend(
    {
       
        className: "scrollableColumnContainer athleteHomeActivities",

        initialize: function(options)
        {
            // initialize the superclass to setup scrolling and other behaviors
            this.constructor.__super__.initialize.call(this);

            this.startDate = moment().subtract("weeks", 3);
            this.endDate = moment().add("weeks", 3);

            this.collection = new ActivityCollection(null, { startDate: this.startDate, endDate: this.endDate });
            this.collection.createDayModels();

            this._initializeScrollableCollectionView();
            this.on("render", this._showScrollableCollectionView, this);
        },

        _initializeScrollableCollectionView: function()
        {
            var self = this;
            this._requestActivities(this.startDate, this.endDate).done(function(){ self._scrollToTomorrow(); });

            this.scrollableCollectionView = new ScrollableCollectionView({
                firstModel: this._getFirstModel(),
                itemView: this._createItemView,
                collection: this.collection,
                id: "activityFeedContainer",
                className: "activityCollection scrollable",
                onScrollEnd: _.bind(this._loadDataAfterScroll, this),
                batchSize: 7,
                scrollThreshold: 300,
                minSize: 30,
                maxSize: 60,
                filterScrollTarget: function(childView)
                {
                    return childView.$el.is(".day");
                }
            });
        },

        _showScrollableCollectionView: function()
        {
            this.$(".contents").removeClass("scrollable");
            this.contentRegion.show(this.scrollableCollectionView);
            this._scrollToTomorrow();
        },

        _scrollToTomorrow: function()
        {
            var self = this;
            setImmediate(function()
            {
                self.scrollableCollectionView.scrollToModel(self._getFirstModel());
            });
        },

        _createItemView: function(options)
        {
            var model = options.model ? options.model : options;

            if (model instanceof WorkoutModel)
                return new WorkoutBarView(options);
            else if (model.isDay)
                return new DayBarView(options);
            else
                throw "unknown item view class for athlete home activity";
        },

        _getFirstModel: function()
        {
            var tomorrow = moment().add("days", 1).format(TP.utils.datetime.shortDateFormat);
            return this.collection.get(tomorrow);
        },

        _loadDataAfterScroll: function()
        {
            var self = this;

            var allVisibleModels = this.scrollableCollectionView.getVisibleModels();

            var firstDay = null;
            var lastDay = null;

            _.each(this.scrollableCollectionView.getVisibleModels(), function(model)
            {
                if(model.isDay && !firstDay)
                {
                    firstDay = model;
                }

                if(model.isDay)
                {
                    lastDay = model;
                }

            }, this);

            var firstDate, lastDate;
            if(firstDay > lastDay)
            {
                firstDate = firstDay.get("date");
                lastDate = lastDay.get("date");
            }
            else
            {
                firstDate = lastDay.get("date");
                lastDate = firstDay.get("date");
            }

            firstDay = moment(firstDate);
            lastDay = moment(lastDate);

            if(firstDay < self.startDate)
            {
                var endDate = self.startDate.subtract("days", 1);
                self.startDate = firstDay;
                self._requestActivities(self.startDate, endDate);
            }

            if(lastDay > self.endDate)
            {
                var startDate = self.endDate.add("days", 1);
                self.endDate = lastDay;
                self._requestActivities(startDate, self.endDate);
            }

        },

        _requestActivities: function(startDate, endDate)
        {
            var activityCollection = new ActivityCollection(null, { startDate: startDate, endDate: endDate });
            var fetchPromise = activityCollection.fetch();
            this.collection.createDayModels(startDate, endDate);

            var self = this;
            fetchPromise.done(function()
            {
                self.collection.trigger("before:changes");
                self.collection.add(activityCollection.models);
                self.collection.trigger("after:changes");
            });

            return fetchPromise;
        }

    });
});
