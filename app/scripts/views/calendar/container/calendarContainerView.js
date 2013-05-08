define(
[
    "underscore",
    "TP",
    "views/calendar/calendarWeekView",
    "views/calendar/moveItems/selectedRangeSettings",
    "views/calendar/moveItems/shiftWizzardView",
    "views/calendar/container/calendarContainerViewScrolling",
    "hbs!templates/views/calendar/container/calendarContainerView"
],
function (_, TP, CalendarWeekView, SelectedRangeSettingsView, ShiftWizzardView, CalendarContainerViewScrolling, calendarContainerView)
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

        ui:
        {
            "weeksContainer": "#weeksContainer"
        },

        modelEvents:
        {
            "change": "render"
        },

        collectionEvents:
        {
            "add": "onAddWeek",
            "reset": "render",
            "item:move": "onItemMoved",
            "shiftwizard:open": "onShiftWizardOpen",
            "rangeselect": "onRangeSelect"
        },

        initialize: function(options)
        {

            if (!this.collection)
                throw "CalendarView needs a Collection!";

            this.initializeScrolling();
            this.on("render", this.setupKeyBindingsOnRender, this);
            this.on("render", this.addWeeksOnRender, this);


            _.bindAll(this, "resizeContainer");
            $(window).on("resize", this.resizeContainer);

            this.calendarHeaderModel = options.calendarHeaderModel;
            this.startOfWeekDayIndex = options.startOfWeekDayIndex ? options.startOfWeekDayIndex : 0;
        },

        resizeHeight: function()
        {
            var $window = $(window);
            var headerHeight = $("#navigation").height();
            var windowHeight = $window.height();
            var weeksContainerHeight = windowHeight - headerHeight - 75;
            if (this.$el.closest("#calendarContainer").width() < 1007)
            {
                weeksContainerHeight -= 28;
            }
            this.$(".scrollable").css({ height: weeksContainerHeight + 'px' });
            
        },

        resizeContainer: function(event)
        {
            this.resizeHeight();

            // make sure we still fit in window
            var $window = $(window);
            var wrapper = this.$el.closest("#calendarWrapper");
            var library = wrapper.find("#libraryContainer");
            var calendarContainer = this.$el.closest("#calendarContainer");
            var parentWidth = wrapper.width() < $window.width() ? wrapper.width() : $window.width();

            // account for library padding
            var padding = library.outerWidth() - library.width();
            var calendarWidth = parentWidth - library.outerWidth() - padding;
            calendarContainer.width(calendarWidth);
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

        onAddWeek: function(model)
        {
            var weekCollection = model.get("week");
            this.addWeek({ model: model, collection: weekCollection, append: arguments[2].append });
        },

        addWeek: function(options)
        {
            var weekView = new CalendarWeekView({ collection: options.collection, model: options.model });
            weekView.on("itemview:itemDropped", this.onItemDropped, this);

            if (options.append)
                this.ui.weeksContainer.append(weekView.render().el);
            else
            {
                this.ui.weeksContainer.prepend(weekView.render().el);
                this.ui.weeksContainer.scrollTop(this.ui.weeksContainer.scrollTop() + weekView.$el.height());
            }

            // display waiting indicator, then once controller loads the models they will turn off via sync event
            weekView.onWaitStart();

            this.children.push(weekView);
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

        addWeeksOnRender: function()
        {
            var numWeeks = this.collection.length;
            var i = 0;

            for (; i < numWeeks; i++)
            {
                var weekModel = this.collection.at(i);
                this.addWeek({ model: weekModel, collection: weekModel.get("week"), append: true });
            }

            this.resizeHeight();
        },

        // onShow happens after render finishes and dom has updated ...
        onShow: function()
        {
            this.scrollToSelector(".today");
        },

        onItemDropped: function(itemView, options)
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

        fadeIn: function(duration)
        {
            if (this.$el)
            {
                this.$el.fadeIn({ duration: duration });
            }
        },

        onRangeSelect: function(rangeSelection, e)
        {
            var rangeSettingsView = new SelectedRangeSettingsView({ collection: rangeSelection });
            rangeSettingsView.render().left(e.pageX - 30).bottom(e.pageY);
        },

        onLibraryAnimate: function(libraryAnimationCssAttributes, duration)
        {
            var libraryWidth = libraryAnimationCssAttributes.width;
            var wrapperWidth = this.$el.closest("#calendarWrapper").width();
            var calendarWidth = wrapperWidth - libraryWidth;
            var calendarContainer = this.$el.closest("#calendarContainer");
            var cssAttributes = { width: calendarWidth };

            _.bindAll(this, "onLibraryAnimateProgress");

            var self = this;
            var onComplete = function()
            {
                self.updateWeekHeights();
                self.scrollToLastViewedDate(0);
            };
            calendarContainer.animate(cssAttributes, { progress: this.onLibraryAnimateProgress, duration: duration, complete: onComplete });
        },

        updateWeekHeights: function()
        {
            this.collection.each(function(model)
            {
                model.trigger("library:resize");
            });
        },

        onLibraryAnimateProgress: function()
        {
            this.scrollToLastViewedDate(0);
        },

        onKeyDown: function(e)
        {

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
        }
    };

    _.extend(CalendarContainerView, CalendarContainerViewScrolling);

    return TP.ItemView.extend(CalendarContainerView);
});