define(
[
    "underscore",
    "TP",
    "views/calendarWeekView",
    "views/selectedRangeSettings",
    "views/shiftWizzardView",
    "hbs!templates/views/calendarContainerView"
],
function(_, TP, CalendarWeekView, SelectedRangeSettingsView, ShiftWizzardView, calendarContainerView)
{
    return TP.ItemView.extend(
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
            "item:move": "onItemMoved"
        },

        initialize: function(options)
        {

            if (!this.collection)
                throw "CalendarView needs a Collection!";

            _.bindAll(this, "checkCurrentScrollPosition");
            
            // theMarsApp.user.on("change", this.setWorkoutColorization, this);

            _.bindAll(this, "resizeContainer");
            $(window).on("resize", this.resizeContainer);

            this.calendarHeaderModel = options.calendarHeaderModel;
            this.throttledCheckForPosition = _.throttle(this.checkCurrentScrollPosition, 100);
            this.startOfWeekDayIndex = options.startOfWeekDayIndex ? options.startOfWeekDayIndex : 0;
            this.collection.on("shiftwizard:open", this.onShiftWizardOpen, this);
        },

        resizeHeight: function()
        {
            var $window = $(window);
            var headerHeight = $("#navigation").height();
            var windowHeight = $window.height();
            this.$(".scrollable").css({ height: windowHeight - headerHeight - 75 + 'px' });
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

        onAddWeek: function (model)
        {
            //theMarsApp.logger.startTimer("CalendarView.onAddWeek", "Before adding a week");
            var weekCollection = model.get("week");
            this.addWeek({ model: model, collection: weekCollection, append: arguments[2].append });
            //theMarsApp.logger.logTimer("CalendarView.onAddWeek", "Finished adding a week (but before the browser displays it)");
            //theMarsApp.logger.waitAndLogTimer("CalendarView.onAddWeek", "Browser has now displayed the week");
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

        onRender: function()
        {
            //this.setWorkoutColorization();
            _.bindAll(this, "onScroll");
            this.ui.weeksContainer.scroll(this.onScroll);

            _.bindAll(this, "onScrollStop");
            var debouncedScrollStop = _.debounce(this.onScrollStop, 300);
            this.ui.weeksContainer.scroll(debouncedScrollStop);

            // keydown, because keypress doesn't seem to register with ctrl key, and keyup doesn't register command key in chrome on mac
            _.bindAll(this, "onKeyDown");
            $(document).on('keydown', this.onKeyDown);

            // prevent autorepeat keydown
            _.bindAll(this, "onKeyUp");
            $(document).on('keyup', this.onKeyUp);

            //theMarsApp.logger.startTimer("CalendarView.onRender", "Begin rendering weeks");

            var numWeeks = this.collection.length;
            var i = 0;

            for (; i < numWeeks; i++)
            {
                var weekModel = this.collection.at(i);
                this.addWeek({ model: weekModel, collection: weekModel.get("week"), append: true });
            }

            //theMarsApp.logger.logTimer("CalendarView.onRender", "Finished rendering weeks (but before the browser displays them)");
            //theMarsApp.logger.waitAndLogTimer("CalendarView.onRender", "Browser has now rendered the weeks");
            this.resizeHeight();

            this.checkCurrentScrollPosition();

            this.collection.on("rangeselect", this.onRangeSelect, this);
        },

        // onShow happens after render finishes and dom has updated ...
        onShow: function()
        {
            this.scrollToSelector(".today");
        },

        onScrollStop: function()
        {
            this.scrolling = false;
            this.$el.find(".daysOfWeek").removeClass("scrollInProgress");
            
            var uiOffset = this.ui.weeksContainer.offset();
            var currentWeek = $(document.elementFromPoint(uiOffset.left, uiOffset.top)).closest(".week");
            var nextWeek = currentWeek.next(".week");

            var weeksContainerTop = uiOffset.top;

            if (!currentWeek || !currentWeek.offset())
                return;

            var currentWeekOffset = Math.abs(currentWeek.offset().top - weeksContainerTop);
            var nextWeekOffset = Math.abs(nextWeek.offset().top - weeksContainerTop);

            var threshhold = 100;
            var animationTimeout = 300;
            if (currentWeekOffset > 0 && currentWeekOffset <= threshhold)
            {
                this.scrollToElement(currentWeek, animationTimeout);
                this.snappedToWeekHeader = true;
            }
            else if (nextWeekOffset > 0 && nextWeekOffset <= threshhold)
            {
                this.scrollToElement(nextWeek, animationTimeout);
                this.snappedToWeekHeader = true;
            }
            else if (nextWeekOffset === 0 || currentWeekOffset === 0)
            {
                this.snappedToWeekHeader = true;
            }
            else
            {
                this.snappedToWeekHeader = false;
            }
        },

        onScroll: function()
        {
            if (!this.scrolling)
            {
                this.$el.find(".daysOfWeek").addClass("scrollInProgress");
                this.scrolling = true;
            }

            var howMuchIHave = this.ui.weeksContainer[0].scrollHeight;
            var howMuchIsVisible = this.ui.weeksContainer.height();
            var hidden = howMuchIHave - howMuchIsVisible;
            var scrollDownThresholdInPx = 150;
            var scrollUpThresholdInPx = 100;

            if (this.ui.weeksContainer.scrollTop() <= scrollUpThresholdInPx)
            {
                // Within the threshold at the TOP. Add row & request data.
                this.trigger("prepend");
            }
            else if (this.ui.weeksContainer.scrollTop() >= (hidden - scrollDownThresholdInPx))
            {
                // Within the threshold at the BOTTOM. Add row & request data.
                this.trigger("append");
            }

            this.throttledCheckForPosition();
            
            return;
        },

        scrollToSelector: function(selector, animationTimeout)
        {
            var elements = this.ui.weeksContainer.find(selector);
            if (elements && elements.length)
            {
                return this.scrollToElement(elements[0], animationTimeout);
            } else
            {
                theMarsApp.logger.debug("ScollTo Selector not found: " + selector);
            }
        },

        scrollToElement: function(element, animationTimeout)
        {
            var $element = $(element);
            if ($element.is(".day"))
                $element = $element.parent();

            if (!$element.is(".week"))
                throw "Invalid scroll element - must be a .day or .week (" + $element.attr("class") + ")";

            var requestedElementOffsetFromContainer = $element.position().top;
            var scrollToOffset = this.ui.weeksContainer.scrollTop() + requestedElementOffsetFromContainer - this.ui.weeksContainer.position().top;

            if (typeof animationTimeout === "undefined" && requestedElementOffsetFromContainer < 300)
                animationTimeout = 500;
            else if (typeof animationTimeout === "undefined" && requestedElementOffsetFromContainer > 1500)
                animationTimeout = 2000;

            this.ui.weeksContainer.animate(
            {
                scrollTop: scrollToOffset
            }, animationTimeout, this.checkCurrentScrollPosition);
        },

        scrollToDate: function(targetDate, effectDuration)
        {
            var dateAsMoment = moment(targetDate);

            if (typeof effectDuration === "undefined")
                effectDuration = 500;

            //theMarsApp.logger.debug(dateAsMoment.format("YYYY-MM-DD"));
            var dateAsString = dateAsMoment.format("YYYY-MM-DD");
            var selector = '.day[data-date="' + dateAsString + '"]';
            this.scrollToSelector(selector, effectDuration);
            this.setCurrentDate(targetDate);
            this.snappedToWeekHeader = true;
        },
        
        onItemDropped: function(itemView, options)
        {
            this.trigger("itemDropped", options);
        },

        onItemMoved: function(item, movedToDate, deferredResult)
        {
            this.trigger("itemMoved", item, movedToDate, deferredResult);
        },

        getCurrentScrollDate: function()
        {
            if (!document.elementFromPoint)
                return null;

            var uiOffset = this.ui.weeksContainer.offset();
            var $currentElement = $(document.elementFromPoint(uiOffset.left, uiOffset.top));
            var $currentWeek = $currentElement.closest(".week");
            var $lastDayOfWeek = $currentWeek.find(".day:last");
            if ($currentWeek && $lastDayOfWeek && $lastDayOfWeek.data("date"))
            {
                return $lastDayOfWeek.data("date");
            } else
            {
                return null;
            }
        },

        checkCurrentScrollPosition: function()
        {
            var scrollDate = this.getCurrentScrollDate();
            if (!scrollDate)
                return;
            this.setCurrentDate(scrollDate);
        },

        setCurrentDate: function(currentDate)
        {
            var dateAsMoment = moment(currentDate);
            var endOfWeek = this.startOfWeekDayIndex === 0 ? 6 : 0;
            if (dateAsMoment.day() !== endOfWeek)
                dateAsMoment.day(this.startOfWeekDayIndex + 6);

            if (currentDate)
                this.calendarHeaderModel.set("date", dateAsMoment.format("YYYY-MM-DD"));
        },

        fadeOut: function(duration)
        {
            if(this.$el)
            {
                this.$el.fadeOut({ duration: duration });
            }
        },

        fadeIn: function(duration)
        {
            if(this.$el)
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

        // if we un-snapped from the week header because of text wrapping on library show/hide,
        // or if we scrolled into a different week, snap back to the correct week
        scrollToLastViewedDate: function(duration)
        {
            if (typeof duration === "undefined")
                duration = 100;

            var headerDate = this.getHeaderDate();
            var scrollDate = this.getCurrentScrollDate();
            if (this.snappedToWeekHeader || headerDate !== scrollDate)
            {
                this.scrollToDate(moment(headerDate), duration);
            }
        },

        getHeaderDate: function()
        {
            return this.calendarHeaderModel.get("date");
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

    });
});