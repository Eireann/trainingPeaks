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

            //this.initializeScrolling();
            this.initializeScrollOnDrag();
            this.on("render", this.setupKeyBindingsOnRender, this);
            //this.on("render", this.addWeeksOnRender, this);
            this.on("calendar:unselect", this.onCalendarUnSelect, this);

            this.on("close", this.closeChildren, this);

            this.calendarHeaderModel = options.calendarHeaderModel;
            this.startOfWeekDayIndex = options.startOfWeekDayIndex ? options.startOfWeekDayIndex : 0;

            this.weeksCollectionView = new ScrollableCollectionView({itemView: CalendarWeekView, collection: this.collection, id: 'weeksContainer', className: "scrollable colorByComplianceAndWorkoutType"});
        },
        
        render: function()
        {
            var self = this;

            PrimaryContainerView.prototype.render.apply(this, arguments);

            this.listenTo(this.weeksCollectionView, 'itemview:render', function(weekView)
            {
                weekView.on("itemview:itemDropped", self.onItemDropped, self);
                //weekView.onWaitStart();
            });

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

        // onAddWeek: function(model)
        // {
        //     return;
        //     var weekCollection = model.get("week");
        //     this.addWeek({ model: model, collection: weekCollection, append: arguments[2].append });
        // },

        // addWeek: function(options)
        // {
        //     var weekView = new CalendarWeekView({ collection: options.collection, model: options.model });
        //     weekView.on("itemview:itemDropped", this.onItemDropped, this);
            
        //     if (options.append)
        //         this.ui.weeksContainer.append(weekView.render().el);
        //     else
        //     {
        //         this.ui.weeksContainer.prepend(weekView.render().el);
        //         this.ui.weeksContainer.scrollTop(this.ui.weeksContainer.scrollTop() + weekView.$el.height());
        //     }

        //     // display waiting indicator, then once controller loads the models they will turn off via sync event
        //     weekView.onWaitStart();

        //     this.children.push(weekView);
        // },

        setupKeyBindingsOnRender: function()
        {

            // keydown, because keypress doesn't seem to register with ctrl key, and keyup doesn't register command key in chrome on mac
            _.bindAll(this, "onKeyDown");
            $(document).on('keydown', this.onKeyDown);

            // prevent autorepeat keydown
            _.bindAll(this, "onKeyUp");
            $(document).on('keyup', this.onKeyUp);
        },

        // addWeeksOnRender: function()
        // {
        //     return;
        //     // var numWeeks = this.collection.length;
        //     // var i = 0;

        //     // for (; i < numWeeks; i++)
        //     // {
        //     //     var weekModel = this.collection.at(i);
        //     //     this.addWeek({ model: weekModel, collection: weekModel.get("week"), append: true });
        //     // }

        //     // this.resizeContainer();
        // },

        // onShow happens after render finishes and dom has updated ...
        onShow: function()
        {
            this.weeksCollectionView.triggerMethod("show");
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

        onLibraryAnimateComplete: function()
        {
            this.resizeContainer();
            this.updateWeekHeights();
            this.scrollToLastViewedDate(0);
        },

        onLibraryAnimateProgress: function()
        {
            this.scrollToLastViewedDate(0);
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
