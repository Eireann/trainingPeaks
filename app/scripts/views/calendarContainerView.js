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
            "reset": "render"
        },

        initialize: function(options)
        {
            _.bindAll(this, "checkCurrentScrollPosition");
            
            // theMarsApp.user.on("change", this.setWorkoutColorization, this);

            $(window).on("resize", this.resizeContext);

            this.calendarHeaderModel = options.calendarHeaderModel;
            this.throttledCheckForPosition = _.throttle(this.checkCurrentScrollPosition, 100);

            this.collection.on("shiftwizard", this.onShiftWizardOpen, this);
        },

        resizeContext: function (event)
        {
            var headerHeight = $("#navigation").height();
            var windowHeight = $(window).height();
            this.$(".scrollable").css({ height: windowHeight - headerHeight - 75 +'px' });
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
            if (!this.collection)
                throw "CalendarView needs a Collection!";

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

            this.resizeContext();
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
            var uiOffset = this.ui.weeksContainer.offset();
            var currentWeek = $(document.elementFromPoint(uiOffset.left, uiOffset.top)).closest(".week");
            var nextWeek = currentWeek.next(".week");

            var weeksContainerTop = uiOffset.top;
            var currentWeekOffset = Math.abs(currentWeek.offset().top - weeksContainerTop);
            var nextWeekOffset = Math.abs(nextWeek.offset().top - weeksContainerTop);

            var threshhold = 100;
            var animationTimeout = 300;
            if (currentWeekOffset > 0 && currentWeekOffset <= threshhold)
            {
                this.scrollToElement(currentWeek, animationTimeout);
                this.snappedToWeekHeader = true;
            } else if (nextWeekOffset > 0 && nextWeekOffset <= threshhold)
            {
                this.scrollToElement(nextWeek, animationTimeout);
                this.snappedToWeekHeader = true;
            } else if (nextWeekOffset === 0 || currentWeekOffset === 0)
            {
                this.snappedToWeekHeader = true;
            } else
            {
                this.snappedToWeekHeader = false;
            }
        },

        onScroll: function()
        {
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

            if (!animationTimeout && requestedElementOffsetFromContainer < 300)
                animationTimeout = 500;
            else if (!animationTimeout && requestedElementOffsetFromContainer > 1500)
                animationTimeout = 2000;

            this.ui.weeksContainer.animate(
            {
                scrollTop: scrollToOffset
            }, animationTimeout, this.checkCurrentScrollPosition);
        },

        scrollToDate: function(dateAsMoment, effectDuration)
        {
            //theMarsApp.logger.debug(dateAsMoment.format("YYYY-MM-DD"));
            var dateAsString = dateAsMoment.format("YYYY-MM-DD");
            var selector = '.day[data-date="' + dateAsString + '"]';
            this.scrollToSelector(selector, effectDuration || 500);
            this.snappedToWeekHeader = true;
        },
        
        onItemDropped: function(itemView, options)
        {
            this.trigger("itemDropped", options);
        },

        getCurrentScrollDate: function()
        {
            if (!document.elementFromPoint)
                return null;

            var uiOffset = this.ui.weeksContainer.offset();
            var $currentWeek = $(document.elementFromPoint(uiOffset.left, uiOffset.top)).closest(".week");
            var $lastDayOfWeek = $currentWeek.find(".day:last");
            if ($lastDayOfWeek.data("date"))
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
            if (currentDate)
                this.calendarHeaderModel.set("date", currentDate);
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
            var rangeSettingsView = new SelectedRangeSettingsView({ left: e.pageX, top: e.pageY, collection: rangeSelection });
            rangeSettingsView.render();
        },

        onLibraryShow: function()
        {
            this.scrollToLastViewedDate();
        },

        onLibraryHide: function()
        {
            this.scrollToLastViewedDate();
        },

        // if we un-snapped from the week header because of text wrapping on library show/hide,
        // or if we scrolled into a different week, snap back to the correct week
        scrollToLastViewedDate: function()
        {
            var headerDate = this.calendarHeaderModel.get("date");
            var scrollDate = this.getCurrentScrollDate();
            if (this.snappedToWeekHeader || headerDate !== scrollDate)
            {
                this.scrollToDate(moment(headerDate), 100);
            }
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
            this.shiftWizzardView = new ShiftWizzardView();
            this.shiftWizzardView.render();
        }

    });
});