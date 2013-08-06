define(
[
    "underscore",
    "TP",
    "views/pageContainer/primaryContainerView",
    "views/calendar/calendarWeekView",
    "views/calendar/moveItems/selectedRangeSettings",
    "views/calendar/moveItems/shiftWizzardView",
    "views/calendar/container/calendarContainerViewScrolling",
    "views/scrollableCollectionView",
    "hbs!templates/views/calendar/container/calendarContainerView"
],
function(
    _,
    TP,
    PrimaryContainerView,
    CalendarWeekView,
    SelectedRangeSettingsView,
    ShiftWizzardView,
    CalendarContainerViewScrolling,
    ScrollableCollectionView,
    calendarContainerView)
{
    var CalendarContainerView =
    {
        colorizationClassNames:
        [
            "colorizationOff",
            "colorByWorkoutType",
            "colorByCompliance",
            "colorByComplianceAndWorkoutType"
        ],

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

            if (!this.collection)
                throw "CalendarView needs a Collection!";

            // initialize the superclass
            this.constructor.__super__.initialize.call(this);

            this.on("render", this.setupKeyBindingsOnRender, this);
            //this.on("render", this.addWeeksOnRender, this);
            this.on("calendar:unselect", this.onCalendarUnSelect, this);

            this.on("close", this.closeChildren, this);

            this.calendarHeaderModel = options.calendarHeaderModel;
            this.startOfWeekDayIndex = options.startOfWeekDayIndex ? options.startOfWeekDayIndex : 0;

            this.initializeScrollOnDrag();

            this.weeksCollectionView = new ScrollableCollectionView({
                firstModel: this.collection.find(function(model) { return TP.utils.datetime.isThisWeek(model.id); }),
                itemView: CalendarWeekView,
                collection: this.collection,
                id: "weeksContainer",
                className: "scrollable colorByComplianceAndWorkoutType",
                scrollCallback: _.bind(this.scrollCallback, this)
            });
            this.listenTo(this.weeksCollectionView, "itemview:itemview:itemDropped", _.bind(this.onItemDropped, this));
        },

        scrollCallback: function() {
            // QL TODO: don't run requestWorkouts() for ranges that already have data
            var self = this,
                startDate = this.weeksCollectionView.getCurrentModel().get('id'),
                endDate = this.weeksCollectionView.getLastVisibleModel().get('id');

            this.collection.forEachWeek(startDate, endDate, function(weekDate) {
                var week = self.collection.get(weekDate),
                    weekMoment;
                if (week) {
                    if (week.get('isFetched')) {
                        return;
                    }
                    weekMoment = moment(week.get('id'));
                    self.collection.requestWorkouts(weekMoment, weekMoment.clone().add("days", 7));
                }
            });
        },

        onRender: function()
        {
            this.weeksRegion.show(this.weeksCollectionView);
            this.ui.weeksContainer = this.weeksCollectionView.$el;

            // Show drop-shadow during scrolling.
            this.weeksCollectionView.$el.on("scroll", _.bind(this.startScrollingState, this));
            this.weeksCollectionView.$el.on("scroll", _.bind(_.debounce(this.stopScrollingState, 500), this));
        },

        modelEvents:
        {
            "change": "render"
        },

        collectionEvents:
        {
            //"add": "onAddWeek",
            // "reset": "render",
            "item:move": "onItemMoved",
            "shiftwizard:open": "onShiftWizardOpen",
            "rangeselect": "onRangeSelect",
            "select": "onCalendarSelect"
        },

        setWorkoutColorization: function()
        {
            var settings = theMarsApp.user.get("settings");
            if (settings && settings.calendar)
            {
                var colorizationCode = settings.calendar.workoutColorization;
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
            }
        },

        setupKeyBindingsOnRender: function()
        {

            // keydown, because keypress doesn't seem to register with ctrl key, and keyup doesn't register command key in chrome on mac
            _.bindAll(this, "onKeyDown");
            $(document).on('keydown', this.onKeyDown);

            // prevent autorepeat keydown
            _.bindAll(this, "onKeyUp");
            $(document).on('keyup', this.onKeyUp);
        },

        getCurrentWeek: function()
        {
            return this.weeksCollectionView.getCurrentModel().id;
        },

        scrollToDate: function(targetDate, effectDuration, callback)
        {
            if(callback) console.warn("Callback not supported on scrollToDate", callback);

            var dateAsMoment = moment(targetDate);

            if (typeof effectDuration === "undefined")
                effectDuration = 500;

            // QL TODO: This works incorrectly for Sunday...
            var id = dateAsMoment.day(this.startOfWeekDayIndex).format(TP.utils.datetime.shortDateFormat);
            var model = this.collection.get(id);
            this.weeksCollectionView.scrollToModel(model, effectDuration);
        },

        onItemDropped: function(weekView, dayView, options)
        {
            this.trigger("itemDropped", options);
        },

        onItemMoved: function(item, movedToDate, deferredResult)
        {
            this.trigger("itemMoved", item, movedToDate, deferredResult);
        },

        onRangeSelect: function(rangeSelection, e)
        {
            var rangeSettingsView = new SelectedRangeSettingsView({ collection: rangeSelection });
            rangeSettingsView.render().left(e.pageX - 30).bottom(e.pageY);
            var onRangeSettingsClose = function()
            {
                rangeSelection.trigger("range:unselect", rangeSelection);
            };
            rangeSettingsView.once("close", onRangeSettingsClose);
            rangeSettingsView.once("beforeShift", function()
            {
                rangeSettingsView.off("close", onRangeSettingsClose);
            }, this);

        },

        onLibraryAnimateSetup: function()
        {
            this.weeksCollectionView.lockScrollPosition();
        },

        onLibraryAnimateComplete: function()
        {
            this.resizeContainer();
            this.updateWeekHeights();
            this.weeksCollectionView.unlockScrollPosition();
        },

        onLibraryAnimateProgress: function()
        {
            this.weeksCollectionView.resetScrollPosition();
        },

        updateWeekHeights: function()
        {
            this.collection.each(function(model)
            {
                model.trigger("library:resize");
            });
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
            var calendarContainer = this.ui.weeksContainer.closest("#calendarContainer");

            var calendarPosition = {
                top: calendarContainer.offset().top,
                bottom: calendarContainer.offset().top + calendarContainer.height()
            };

            var uiPosition = {
                mouse: e.pageY,
                top: ui.helper.position().top,
                bottom: ui.helper.position().top + ui.helper.height()
            };

            this.autoScrollIfNecessary(calendarPosition, uiPosition);
        },

        autoScrollIfNecessary: function(calendarPosition, uiPosition)
        {

            var topThreshold = calendarPosition.top + 10;
            var bottomThreshold = calendarPosition.bottom - 20;
            var stopThreshold = 10;
            var self = this;
            if (uiPosition.top <= topThreshold)
            {
                this.autoScroll("back");
                
            } else if (uiPosition.bottom >= bottomThreshold)
            {
                this.autoScroll("forward");
                
            } else if(uiPosition.top >= (topThreshold + stopThreshold) && uiPosition.bottom <= (bottomThreshold - stopThreshold))
            {
                this.cancelAutoScroll();
            }
        },


        autoScroll: function(direction) {
            var self = this,
                modelOffset = direction === "forward" ? 1 : -1;

            this.cancelAutoScroll();
            this.autoScrollInterval = setInterval(function() {
                var currentModel = self.weeksCollectionView.getCurrentModel(),
                    nextOrPreviousModel = self.weeksCollectionView.collection.at(self.weeksCollectionView.collection.indexOf(currentModel) + modelOffset);
                self.weeksCollectionView.scrollToModel(nextOrPreviousModel, 500);
            },1000);
        },

        cancelAutoScroll: function()
        {
            clearInterval(this.autoScrollInterval);
        },

        onKeyDown: function(e)
        {

            // no keyboard copy/paste on calendar when quickview is open
            if ($(".workoutQuickView").length)
            {
                return;
            }

            // prevent autorepeat
            if (this.keyDownWasProcessed)
                return;

            if (e.isDefaultPrevented())
                return;

            if (!e.ctrlKey && !e.metaKey)
                return;

            // if we're in input or textarea, ignore keypress
            var $target = $(e.target);
            if ($target.is("input") || $target.is("textarea"))
                return;

            var whichKey = String.fromCharCode(e.keyCode);

            switch (whichKey)
            {
            case "C":
                this.keyDownWasProcessed = true;
                this.collection.onKeypressCopy(e);
                break;
            case "X":
                this.keyDownWasProcessed = true;
                this.collection.onKeypressCut(e);
                break;
            case "V":
                this.keyDownWasProcessed = true;
                this.collection.onKeypressPaste(e);
                break;
            }

        },

        onKeyUp: function()
        {
            this.keyDownWasProcessed = false;
        },

        onShiftWizardOpen: function()
        {
            this.shiftWizzardView = new ShiftWizzardView({ selectionStartDate: this.collection.getSelectionStartDate(), selectionEndDate: this.collection.getSelectionEndDate() });
            this.shiftWizzardView.on("shifted", this.onShiftWizardShifted, this);
            this.shiftWizzardView.on("close", this.onCalendarUnSelect, this);
            this.shiftWizzardView.render();
        },

        onShiftWizardShifted: function(shiftCommandResult)
        {
            _.bindAll(this, "afterWorkoutsShifted");
            shiftCommandResult.done(this.afterWorkoutsShifted);
        },

        afterWorkoutsShifted: function(shiftCommand)
        {
            this.trigger("workoutsShifted", shiftCommand);
        },

        onCalendarSelect: function()
        {
            this.trigger("calendar:select");
        },

        onCalendarUnSelect: function()
        {
            this.collection.trigger("calendar:unselect");
        }
    };

    _.extend(CalendarContainerView, CalendarContainerViewScrolling);

    return PrimaryContainerView.extend(CalendarContainerView);
});
