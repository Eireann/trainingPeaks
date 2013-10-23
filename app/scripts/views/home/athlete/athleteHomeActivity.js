define(
[
    "underscore",
    "setImmediate",
    "TP",
    "moment",
    "views/workout/workoutBarView",
    "views/home/scrollableColumnLayout",
    "views/scrollableCollectionView",
    "shared/utilities/calendarUtility",
    "views/calendar/day/calendarDayView"
],
function(
    _,
    setImmediate,
    TP,
    moment,
    WorkoutBarView,
    ScrollableColumnLayout,
    ScrollableCollectionView,
    CalendarUtility,
    CalendarDayView
)
{
    return ScrollableColumnLayout.extend(
    {
       
        className: "scrollableColumnContainer athleteHomeActivities",

        initialize: function(options)
        {
            // initialize the superclass to setup scrolling and other behaviors
            this.constructor.__super__.initialize.call(this);

            this.calendarManager = theMarsApp.calendarManager;
            this.collection = this.calendarManager.days;

            this.calendarManager.ensureRange(moment().subtract(3, "weeks"), moment().add(3, "weeks"));

            this._initializeScrollableCollectionView();
            this.on("render", this._showScrollableCollectionView, this);
        },

        _initializeScrollableCollectionView: function()
        {
            var self = this;

            this.scrollableCollectionView = new ScrollableCollectionView({
                firstModel: this._getFirstModel(),
                itemView: CalendarDayView,
                collection: this.collection,
                id: "activityFeedContainer",
                className: "activityCollection scrollable",
                onScrollEnd: _.bind(this._loadDataAfterScroll, this),
                batchSize: 7,
                scrollThreshold: 300,
                minSize: 30,
                maxSize: 60
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

        _getFirstModel: function()
        {
            var tomorrow = moment().add("days", 1).format(CalendarUtility.idFormat);
            return this.collection.get(tomorrow);
        },

        _loadDataAfterScroll: function()
        {
            var self = this;

            var allVisibleModels = this.scrollableCollectionView.getVisibleModels();


            var visibleDays = this.scrollableCollectionView.getVisibleModels();
            var firstDay = _.first(visibleDays).id;
            var lastDay = _.last(visibleDays).id;

            firstDay = moment(firstDay);
            lastDay = moment(lastDay);

            this.calendarManager.loadActivities(firstDay, lastDay);

        }

    });
});
