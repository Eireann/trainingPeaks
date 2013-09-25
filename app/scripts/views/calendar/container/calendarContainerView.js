﻿define(
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

            this.on("render", this.setupKeyBindingsOnRender, this);
            //this.on("render", this.addWeeksOnRender, this);
            this.on("calendar:unselect", this.onCalendarUnSelect, this);

            this.on("close", this.closeChildren, this);

            this.calendarHeaderModel = options.calendarHeaderModel;
            this.startOfWeekDayIndex = options.startOfWeekDayIndex ? options.startOfWeekDayIndex : 0;

            this.initializeScrollOnDrag();

            this.weeksCollectionView = new ScrollableCollectionView({
                firstModel: this.collection.getWeekModelForDay((options.firstDate ? moment(options.firstDate) : moment()), options.startOfWeekDayIndex),
                itemView: CalendarWeekView,
                collection: this.collection,
                id: "weeksContainer",
                className: "scrollable colorByComplianceAndWorkoutType",
                onScrollEnd: _.bind(this._loadDataAfterScroll, this)
            });
            this.listenTo(this.weeksCollectionView, "itemview:itemview:itemDropped", _.bind(this.onItemDropped, this));
        },

        _loadDataAfterScroll: function()
        {
            var self = this;
            if (this.isAutoScrolling) {
                return;
            }
            $('.week').removeClass('inView');

            var currentModel = this.weeksCollectionView.getCurrentModel();

            if(currentModel)
            {
                this.calendarHeaderModel.set('currentDay', currentModel.get('id'));
            }

            _.each(this.weeksCollectionView.getVisibleModels(), function(model)
            {
                model.view.$el.addClass('inView');
                if(!model.get("isFetched"))
                {
                    var weekStart = moment(model.id);
                    var weekEnd = moment(model.id).add("days", 6);
                    self.collection.requestWorkouts(weekStart, weekEnd);
                }
            });
        },

        onRender: function()
        {
            this.weeksRegion.show(this.weeksCollectionView);
            this.ui.weeksContainer = this.weeksCollectionView.$el;

            // Show drop-shadow during scrolling.
            this.weeksCollectionView.$el.on("scroll", _.bind(this.startScrollingState, this));

            this.weeksCollectionView.$el.on("scroll", _.bind(this.startScrollingState, this));
            this.weeksCollectionView.$el.on("scroll", _.bind(_.throttle(this._updateCurrentDate, 250), this));
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

        _updateCurrentDate: function()
        {
            this.setCurrentDate(moment(this.getCurrentWeek()));
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

            var model = this.collection.getWeekModelForDay(dateAsMoment, this.startOfWeekDayIndex);

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
            if(!ui || !this.ui || !this.ui.weeksContainer)
                return;
            
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
