define(
[
    "underscore",
    "TP",
    "views/calendarWeekView",
    "hbs!templates/views/calendarContainerView"
],
function(_, TP, CalendarWeekView, calendarContainerView)
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
            theMarsApp.logger.startTimer("CalendarView.onAddWeek", "Before adding a week");
            var weekCollection = model.get("week");
            this.addWeek({ model: model, collection: weekCollection, append: arguments[2].append });
            theMarsApp.logger.logTimer("CalendarView.onAddWeek", "Finished adding a week (but before the browser displays it)");
            theMarsApp.logger.waitAndLogTimer("CalendarView.onAddWeek", "Browser has now displayed the week");
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
            
            theMarsApp.logger.startTimer("CalendarView.onRender", "Begin rendering weeks");

            var numWeeks = this.collection.length;
            var i = 0;

            for (; i < numWeeks; i++)
            {
                var weekModel = this.collection.at(i);
                this.addWeek({ model: weekModel, collection: weekModel.get("week"), append: true });
            }

            theMarsApp.logger.logTimer("CalendarView.onRender", "Finished rendering weeks (but before the browser displays them)");
            theMarsApp.logger.waitAndLogTimer("CalendarView.onRender", "Browser has now rendered the weeks");

            this.resizeContext();
            this.checkCurrentScrollPosition();
        },

        // onShow happens after render finishes and dom has updated ...
        onShow: function()
        {
            this.scrollToSelector(".today");
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
        
        scrollToSelector: function (selector, animationTimeout)
        {
            var requestedElementOffsetFromContainer = this.ui.weeksContainer.find(selector).parent().position().top;
            var scrollToOffset = this.ui.weeksContainer.scrollTop() + requestedElementOffsetFromContainer - this.ui.weeksContainer.position().top;

            if (requestedElementOffsetFromContainer < 300)
                animationTimeout = 500;
            else if (requestedElementOffsetFromContainer > 1500)
                animationTimeout = 2000;

            this.ui.weeksContainer.animate(
            {
                scrollTop: scrollToOffset
            }, animationTimeout);
        },

        scrollToDate: function (dateAsMoment, effectDuration)
        {
            theMarsApp.logger.debug(dateAsMoment.format("YYYY-MM-DD"));
            var dateAsString = dateAsMoment.format("YYYY-MM-DD");
            var selector = '*[data-date="' + dateAsString + '"]';
            this.scrollToSelector(selector, effectDuration || 500);
        },
        
        onItemDropped: function(itemView, options)
        {
            this.trigger("itemDropped", options);
        },

        checkCurrentScrollPosition: function ()
        {
            if (!document.elementFromPoint)
                return;
            
            var $element = $(document.elementFromPoint($(window).width() - 300, this.ui.weeksContainer.offset().top + 50));

            // Wrong element, page still rendering or something went really wrong.
            if ($element.is("html"))
                return;
            
            // If the element is not a .day div, start digging/dom-traversal to find the right div to determine the date
            if (!$element.is(".day"))
            {
                if ($element.is(".week"))
                {
                    $element = $element.children().filter(function()
                    {
                        return $(this).data("date") !== undefined;
                    }).last();
                }
                else if ($element.is("p") ||
                         $element.is(".dayHeader") ||
                         $element.is(".workoutHeader") ||
                         $element.is("label") ||
                         $element.is(".workoutBody") ||
                         $element.is(".workoutDistanceTime") ||
                         $element.is(".workoutDiv"))
                {
                    while (!$element.is(".day"))
                        $element = $element.parent();
                }
                else if ($element.is(".waiting"))
                {
                    $element = $element.parent().children().filter(function()
                    {
                        return $(this).data("date") !== undefined;
                    }).last();
                }
            }

            this.setCurrentDateFromDayElement($element);
        },

        setCurrentDateFromDayElement: function($dayElement)
        {
            if($dayElement.data("date"))
                this.calendarHeaderModel.set("date", $dayElement.data("date"));
        }
    });
});