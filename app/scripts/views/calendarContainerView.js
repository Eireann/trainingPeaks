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

        initialize: function()
        {
            theMarsApp.user.on("change", this.setWorkoutColorization, this);

            //TODO Possibly move this into app.js in some initializer, instead of here?
            $(window).on("resize", this.resizeContext);
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

            this.setWorkoutColorization();

            _.bindAll(this, "onScroll");
            //debounce doesn't seem to help - it's not our function that's slow, it's the browser repainting
            //this.ui.weeksContainer.scroll(_.debounce(this.onScroll, 30));
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
        },

        // onShow happens after render finishes and dom has updated ...
        onShow: function()
        {
            this.resizeContext();
            this.scrollToToday();
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

            return;
        },

        scrollToToday: function()
        {
            var lastWeekOffset = this.$('.today').parent().prev().offset().top;
            var weeksContainerOffset = this.ui.weeksContainer.offset().top;
            this.ui.weeksContainer.scrollTop(lastWeekOffset - weeksContainerOffset);
        },

        onItemDropped: function(itemView, options)
        {
            this.trigger("itemDropped", options);
        }

    });
});