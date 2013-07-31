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
        $weeksContainer: null,

        children: [],
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

            this.weeksCollectionView = new ScrollableCollectionView({
                firstModel: this.collection.find(function(model) { return TP.utils.datetime.isThisWeek(model.id); }),
                itemView: CalendarWeekView,
                collection: this.collection,
                id: 'weeksContainer',
                className: "scrollable colorByComplianceAndWorkoutType"
            });

            this.initializeScrollOnDrag();
        },
        
        render: function()
        {
            var self = this;

            PrimaryContainerView.prototype.render.apply(this, arguments);

            // Listen for itemDroped eventd on Day View
            this.listenTo(this.weeksCollectionView, "itemview:itemview:itemDropped", _.bind(this.onItemDropped, this));

            this.weeksCollectionView.render();
            // this.children.add(this.weeksCollectionView);
            this.$el.append(this.weeksCollectionView.$el);
            this.ui.weeksContainer = this.weeksCollectionView.$el;
        },

        closeChildren: function()
        {
            _.each(this.children, function(childView)
            {
                childView.close();
            });
        },

        ui:
        {
            //"weeksContainer": "#weeksContainer"
        },

        modelEvents:
        {
            "change": "render"
        },

        collectionEvents:
        {
            //"add": "onAddWeek",
            "reset": "render",
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

        // onShow happens after render finishes and dom has updated ...
        onShow: function()
        {
            this.weeksCollectionView.triggerMethod("show");
        },

        onItemDropped: function(weekView, dayView, options)
        {
            this.trigger("itemDropped", options);
        },

        onItemMoved: function(item, movedToDate, deferredResult)
        {
            this.trigger("itemMoved", item, movedToDate, deferredResult);
        },

        fadeOut: function(duration)
        {
            if (this.$el)
            {
                this.$el.fadeOut({ duration: duration });
            }
        },

        // fadeIn: function(callback, duration)
        // {
        //     if (this.$el)
        //     {
        //         this.$el.fadeIn(duration || 500, callback);
        //     }
        // },

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
