define(
[
    "jquery",
    "underscore",
    "moment",
    "TP",
    "views/pageContainer/primaryContainerView",
    "views/calendar/calendarWeekView",
    "views/scrollableCollectionView",
    "shared/utilities/calendarUtility",
    "hbs!templates/views/calendar/container/calendarContainerView"
],
function(
    $,
    _,
    moment,
    TP,
    PrimaryContainerView,
    CalendarWeekView,
    ScrollableCollectionView,
    CalendarUtility,
    calendarContainerView)
{
    var CalendarContainerView = PrimaryContainerView.extend(
    {
        colorizationClassNames:
        [
            "colorizationOff",
            "colorByWorkoutType",
            "colorByCompliance",
            "colorByComplianceAndWorkoutType"
        ],

        attributes: { style: "height: 100%;" },

        template:
        {
            type: "handlebars",
            template: calendarContainerView
        },

        regions:
        {
            weeksRegion: '.weeks-region'
        },

        ui: {},

        initialize: function(options)
        {
            var self = this;
            if (!this.collection)
                throw "CalendarView needs a Collection!";

            // initialize the superclass
            this.constructor.__super__.initialize.call(this);

            this.on("calendar:unselect", this.onCalendarUnSelect, this);

            this.on("close", this.closeChildren, this);

            this.stateModel = options.stateModel;
            this.calendarManager = options.calendarManager || theMarsApp.calendarManager;

            this.initializeScrollOnDrag();

            this.weeksCollectionView = new ScrollableCollectionView({
                firstModel: this.collection.get(CalendarUtility.weekForDate(options.firstDate ? moment(options.firstDate) : moment())),
                itemView: CalendarWeekView,
                collection: this.collection,
                id: "weeksContainer",
                className: "scrollable colorByComplianceAndWorkoutType",
                onScrollEnd: _.bind(this._loadDataAfterScroll, this),
                minSize: 12
            });
            this.listenTo(this.collection, "refresh", _.bind(this._loadDataAfterScroll, this));
        },

        _loadDataAfterScroll: function()
        {
            var self = this;
            if (this.isAutoScrolling) {
                return;
            }
            $('.week').removeClass('inView');

            var visibleWeeks = this.weeksCollectionView.getVisibleModels();

            _.each(visibleWeeks, function(model)
            {
                model.view.$el.addClass('inView');
            });
            
            var weeks = _.map(visibleWeeks, function(week) { return moment(week.id); });
            var start = _.min(weeks);
            var end = _.max(weeks);

            this.calendarManager.loadActivities(start, end);
        },

        onRender: function()
        {
            this.weeksRegion.show(this.weeksCollectionView);
            this.ui.weeksContainer = this.weeksCollectionView.$el;

            // Show drop-shadow during scrolling.
            this.weeksCollectionView.$el.on("scroll", _.bind(this.startScrollingState, this));
            this.weeksCollectionView.$el.on("scroll", _.bind(_.throttle(this._updateCurrentDate, 250), this));
            this.weeksCollectionView.$el.on("scroll", _.bind(_.debounce(this.stopScrollingState, 500), this));
        },

        collectionEvents: {},

        _updateCurrentDate: function()
        {
            var week = this.getCurrentWeek();
            if(week)
            {
                this.stateModel.setDate(week, { source: "scroll" });
            }
        },

        setWorkoutColorization: function()
        {
            var calendarSettings = theMarsApp.user.getCalendarSettings();
            var colorizationCode = calendarSettings.get("workoutColorization");
            var colorizationClassName = this.colorizationClassNames[colorizationCode];

            if (!this.ui.weeksContainer.hasClass(colorizationClassName))
            {
                var view = this;
                _.each(this.colorizationClassNames, function(className)
                {
                    view.ui.weeksContainer.removeClass(className);
                });
                if (colorizationCode > 0)
                {
                    this.ui.weeksContainer.addClass(colorizationClassName);
                }
            }
        },

        getCurrentWeek: function()
        {
            var model = this.weeksCollectionView.getCurrentModel();
            return _.has(model, "id") ? model.id : null;
        },

        scrollToDate: function(targetDate, effectDuration, callback)
        {
            if(callback) console.warn("Callback not supported on scrollToDate", callback);

            if (typeof effectDuration === "undefined")
                effectDuration = 500;

            var model = this.collection.get(CalendarUtility.weekForDate(targetDate));

            this.weeksCollectionView.scrollToModel(model, effectDuration);
        },

        onLibraryAnimateSetup: function()
        {
            this.weeksCollectionView.lockScrollPosition();
        },

        onLibraryAnimateComplete: function()
        {
            this.weeksCollectionView.unlockScrollPosition();
        },

        onLibraryAnimateProgress: function()
        {
            this.weeksCollectionView.resetScrollPosition();
        },

        initializeScrollOnDrag: function()
        {
            this.watchForDragging();

        },

        watchForDragging: function()
        {
            _.bindAll(this, "onDragItem", "cancelAutoScroll");

            $(document).on("drag", this.onDragItem);
            $(document).on("mouseup", this.cancelAutoScroll);

            this.on("close", function()
            {
                $(document).off("drag", this.onDragItem);
                $(document).off("mouseup", this.cancelAutoScroll);
            }, this);
        },

        onDragItem: function(e, ui)
        {
            if(!ui || !this.ui || !this.ui.weeksContainer)
                return;

            var scope = $(e.target).draggable("option", "scope");
            if(scope !== "default")
            {
                return;
            }
            
            var calendarContainer = this.ui.weeksContainer.closest("#calendarContainer");

            var calendarPosition =
            {
                top: calendarContainer.offset().top,
                bottom: calendarContainer.offset().top + calendarContainer.height()
            };

            var uiPosition =
            {
                mouse: e.pageY,
                top: ui.helper.position().top,
                bottom: ui.helper.position().top + ui.helper.height()
            };

            this.autoScrollIfNecessary(calendarPosition, uiPosition);
        },

        autoScrollIfNecessary: function(calendarPosition, uiPosition)
        {

            var topThreshold = calendarPosition.top + 20;
            var bottomThreshold = calendarPosition.bottom - 20;
            var stopThreshold = 10;
            var self = this;

            if (uiPosition.mouse <= topThreshold)
            {
                this.startAutoScrollInterval("back");

            } else if (uiPosition.mouse >= bottomThreshold)
            {
                this.startAutoScrollInterval("forward");

            } else
            {
                this.cancelAutoScroll();
            }

        },


        startAutoScrollInterval: function(direction)
        {
            var self = this;
            
            if (this.autoScrollDirection === direction)
            {
                return;
            }
            this.cancelAutoScroll();
            this.isAutoScrolling = true;
            this.autoScrollDirection = direction;
            this.fireAutoScroll(direction);
            this.autoScrollInterval = setInterval(function()
            {
                self.fireAutoScroll(direction);
            },500);
        },

        fireAutoScroll: function(direction)
        {
            var modelOffset = direction === "forward" ? 1 : -1;
            var currentModel = this.weeksCollectionView.getCurrentModel();
            var targetMoment = moment(currentModel.id).add("weeks", modelOffset);

            this.scrollToDate(targetMoment, 400);
        },

        cancelAutoScroll: function()
        {
            clearInterval(this.autoScrollInterval);
            this.isAutoScrolling = false;
            this.autoScrollDirection = null;
        },

        startScrollingState: function()
        {
            if (!this.scrolling)
            {
                this.$el.find(".daysOfWeek").addClass("scrollInProgress");
                this.scrolling = true;
            }
        },

        stopScrollingState: function()
        {
            this.scrolling = false;
            this.$el.find(".daysOfWeek").removeClass("scrollInProgress");
        },

        scrollToDateIfNotFullyVisible: function(targetDate, effectDuration)
        {
            var dateAsString = moment(targetDate).format(TP.utils.datetime.shortDateFormat);
            var selector = '.day[data-date="' + dateAsString + '"]';

            var $week = $(selector).closest(".week");

            var weekPosition = $week.position();
            if (weekPosition && weekPosition.hasOwnProperty("top") && weekPosition.top < 30 || (weekPosition.top + $week.height() > this.ui.weeksContainer.height()))
            {
                this.scrollToDate(targetDate, effectDuration);
            }

        }
    });

    return CalendarContainerView;
});
