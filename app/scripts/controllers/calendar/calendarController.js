define(
[
    "underscore",
    "moment",
    "setImmediate",
    "TP",
    "controllers/pageContainerController",
    "layouts/calendarLayout",
    "models/calendar/calendarCollection",
    "models/calendar/calendarWeekCollection",
    "models/calendar/calendarDay",
    "views/calendar/calendarHeaderView",
    "views/calendar/container/calendarContainerView",
    "controllers/calendar/dragMoveShift",
    "controllers/calendar/weeksCollectionManagement",
    "controllers/calendar/calendarControlsHeader",
    "controllers/calendar/calendarLibrary"
],
function(
    _,
    moment,
    setImmediate,
    TP,
    PageContainerController,
    CalendarLayout,
    CalendarCollection,
    CalendarWeekCollection,
    CalendarDayModel,
    calendarHeaderView,
    CalendarContainerView,
    calendarControllerDragMoveShift,
    calendarControllerWeeksCollectionManagement,
    calendarControlsHeader,
    calendarLibrary
    )
{

    // base controller functionality
    var calendarControllerBase = {
        summaryViewEnabled: true,

        initialize: function()
        {

            // TODO: split this into a couple different functions 
            this.models = {};
            this.views = {};

            this.startOfWeekDayIndex = 1;

            this.layout = new CalendarLayout();
            this.layout.on("show", this.show, this);

            this.layout.on("close", this.onLayoutClose, this);

            this.startDate = this.createStartDay().subtract("weeks", 4);
            this.endDate = this.createEndDay().add("weeks", 6);

            this.on("refresh", this.onRequestRefresh, this);
            theMarsApp.user.on("athlete:change", this.onAthleteChange, this);

            this.weeksCollectionInitialize();

            // call parent constructor
            this.constructor.__super__.initialize.call(this);

        },

        onLayoutClose: function()
        {
            _.each(this.views, function(view)
            {
                view.close();
            }, this);
        },

        show: function()
        {
            if (this.layout.isClosed)
            {
                return;
            }

            this.initializeHeader();
            this.initializeCalendar();
            this.initializeLibrary();

            this.showViewsInRegions();

            // load the calendar, and aggregate all of the deferreds from each workout request
            var today = moment();
            this.showDate(today);

            this.watchClipboard();

            // wait for user to load ...
            this.setupUserFetchPromise();

            // our parent class PageContainerController needs this to trigger the window resize functionality
            this.trigger("show");
        },

        loadDataAfterUserLoads: function()
        {
            var self = this;
            var onLoad = function(deferreds)
            {
                var today = moment();
                self.scrollToDateAfterLoad(deferreds, today);
            };
            this.loadCalendarData(onLoad);
            this.loadLibraryData();
        },

        setupUserFetchPromise: function()
        {
            var self = this;
            theMarsApp.userFetchPromise.done(function()
            {
                self.loadDataAfterUserLoads();
            });
        },

        showViewsInRegions: function()
        {
            this.showHeader();
            this.layout.calendarRegion.show(this.views.calendar);
            this.layout.libraryRegion.show(this.views.library);
        },

        scrollToDateAfterLoad: function(deferreds, dateToScrollTo, each)
        {
            var ajaxCachingDeferreds = [];
            _.each(deferreds, function(deferred)
            {
                if (deferred.hasOwnProperty("ajaxCachingDeferred"))
                {
                    ajaxCachingDeferreds.push(deferred.ajaxCachingDeferred);
                }
            });

            var calendarController = this;
            // check after each week loads
            if (each)
            {
                var scrollItEachTime = function()
                {
                    setImmediate(function() { calendarController.showDate(moment(dateToScrollTo), 10); });
                };
                _.each(ajaxCachingDeferreds, function(deferred)
                {
                    deferred.done(scrollItEachTime);
                });
                _.each(deferreds, function(deferred)
                {
                    deferred.done(scrollItEachTime);
                });

                // check after they all load
            } else
            {
                // once all of the data has loaded, set a timeout to allow repainting, then scroll to today
                calendarController.wasScrolled = false;
                var scrollItOnce = function()
                {
                    if (!calendarController.wasScrolled)
                    {
                        calendarController.wasScrolled = true;
                        setTimeout(function() { calendarController.showDate(moment(dateToScrollTo), 500); }, 100);
                    }
                };
                if (ajaxCachingDeferreds.length > 0)
                {
                    $.when.apply($, ajaxCachingDeferreds).then(scrollItOnce);
                }

                $.when.apply($, deferreds).then(scrollItOnce);
            }


        },

        loadCalendarData: function(callback)
        {

            //theMarsApp.logger.startTimer("CalendarController", "begin request calendar data");
            // don't make requests until after we display, or else localStorage cache synchronous read blocks browser rendering
            var diff = this.endDate.diff(this.startDate, "weeks");
            var deferreds = [];
            for (var i = 0; i < diff; i++)
            {
                var startDate = moment(this.startDate).add("weeks", i);
                var endDate = moment(startDate).add("days", 6);
                var deferred = this.weeksCollection.requestWorkouts(startDate, endDate);
                deferreds.push(deferred);
            }

            //theMarsApp.logger.logTimer("CalendarController", "finished request calendar data");
            if (callback)
                callback(deferreds);

            return deferreds;
        },

        loadLibraryData: function()
        {
            for (var libraryName in this.libraryCollections)
                this.libraryCollections[libraryName].fetch({ reset: true });
        },

        onPasteEnabled: function()
        {
            theMarsApp.getBodyElement().removeClass('pasteDisabled').addClass('pasteEnabled');
        },

        onPasteDisabled: function()
        {
            theMarsApp.getBodyElement().removeClass('pasteEnabled').addClass('pasteDisabled');
        },

        createStartDay: function(startDate)
        {
            var startMoment = startDate ? moment(startDate) : moment();
            return startMoment.day(this.startOfWeekDayIndex);
        },

        createEndDay: function(endDate)
        {
            var endMoment = endDate ? moment(endDate) : moment();
            return endMoment.day(6 + this.startOfWeekDayIndex);
        },

        resetCollections: function(startDate, endDate)
        {
            this.startDate = moment(startDate);
            this.endDate = moment(endDate);
            this.weeksCollection.resetToDates(moment(this.startDate), moment(this.endDate));
        },

        reset: function(startDate, endDate, scrollToDate)
        {

            this.resetCollections(startDate, endDate);

            if (scrollToDate)
            {
                var self = this;
                var onLoad = function(deferreds)
                {
                    return self.scrollToDateAfterLoad(deferreds, scrollToDate);
                };
                this.loadCalendarData(onLoad);
            }
            else
                this.loadCalendarData();

        },

        clearCacheAndRefresh: function()
        {
            if (theMarsApp.ajaxCachingEnabled)
                theMarsApp.ajaxCaching.clearCache();
            this.weeksCollection.resetToDates(moment(this.startDate), moment(this.endDate));
            this.views.calendar.scrollToLastViewedDate();
            var headerDate = this.views.calendar.getHeaderDate();
            var self = this;
            var onLoad = function(deferreds)
            {
                return self.scrollToDateAfterLoad(deferreds, headerDate);
            };
            this.loadCalendarData(onLoad);
        },

        showDate: function(dateAsMoment, effectDuration)
        {
            if (!dateAsMoment)
                return;

            if (!moment.isMoment(dateAsMoment))
                dateAsMoment = moment(dateAsMoment);

            var calendarView = this.views.calendar;
            var i;

            if (dateAsMoment.day() !== this.startOfWeekDayIndex)
            {
                var newDateAsMoment = this.createStartDay(dateAsMoment);
                if (newDateAsMoment.format(TP.utils.datetime.shortDateFormat) > dateAsMoment.format(TP.utils.datetime.shortDateFormat))
                {
                    newDateAsMoment.subtract("weeks", 1);
                }
                dateAsMoment = newDateAsMoment;
                //dateAsMoment = weekStartDay > dateAsMoment ? weekStartDay.subtract("weeks", 1) : weekStartDay;
            }

            if (dateAsMoment.unix() >= this.startDate.unix() && dateAsMoment.unix() <= this.endDate.unix())
            {
                // The requested date is within the currently rendered weeks.
                // Let's scroll straight to it.
                calendarView.scrollToDate(dateAsMoment, effectDuration);
                return;
            }
            else if(dateAsMoment.diff(this.endDate, "weeks") >= 8 || dateAsMoment.diff(this.startDate, "weeks") <= -8)
            {
                // The requested date is too far outside the currently rendered weeks.
                // Fade out the calendar, rerender centered on the requested date, and fade in.
                var newStartDate = this.createStartDay(dateAsMoment).subtract("weeks", 4);
                var newEndDate = this.createEndDay(dateAsMoment).add("weeks", 6);
                this.reset(newStartDate, newEndDate, dateAsMoment);
            }
            else if(dateAsMoment < this.startDate)
            {

                // prepend only one week at a time, or else the scroll gets jumpy because we're changing the div height vs scrolltop
                var weeksToPrepend = this.startDate.diff(dateAsMoment, "weeks") + 1;
                for(i = 0;i<weeksToPrepend;i++)
                {
                    this.prependWeekToCalendar();
                }
                calendarView.scrollToDate(dateAsMoment, effectDuration);
            }
            else if (dateAsMoment > this.endDate)
            {
                var weeksToAppend = dateAsMoment.diff(this.endDate, "weeks") + 2;
                for (i = 0; i < weeksToAppend; i++)
                {
                    this.appendWeekToCalendar();
                }
                calendarView.scrollToDate(dateAsMoment, effectDuration);
            }

            // is this necessary?
            setImmediate(function()
            {
                calendarView.scrollToDate(dateAsMoment, effectDuration);
            });

        },

        initializeCalendar: function()
        {
            var weekDaysModel = new TP.Model({ startOfWeekDayIndex: this.startOfWeekDayIndex });
            
            if (this.views.calendar)
                this.views.calendar.close();

            this.views.calendar = new CalendarContainerView({
                model: weekDaysModel, collection: this.weeksCollection,
                calendarHeaderModel: this.models.calendarHeaderModel,
                startOfWeekDayIndex: this.startOfWeekDayIndex
            });

            this.bindToCalendarViewEvents(this.views.calendar);

            this.views.calendar.on("calendar:select", this.onCalendarSelect, this);
        },

        onRequestToday: function()
        {
            this.showDate(moment());
        },

        onRequestRefresh: function(date, callback)
        {
            var dateAsMoment = date ? moment(date) : moment();

            if (dateAsMoment.day() !== this.startOfWeekDayIndex)
            {
                var newDateAsMoment = this.createStartDay(dateAsMoment);
                if (newDateAsMoment.format(TP.utils.datetime.shortDateFormat) > dateAsMoment.format(TP.utils.datetime.shortDateFormat))
                {
                    newDateAsMoment.subtract("weeks", 1);
                }
                dateAsMoment = newDateAsMoment;
            }
            
            var newStartDate = this.createStartDay(dateAsMoment).subtract("weeks", 4);
            var newEndDate = this.createEndDay(dateAsMoment).add("weeks", 6);

            this.reset(newStartDate, newEndDate, dateAsMoment);

            var calendarView = this.views.calendar;
            setImmediate(function ()
            {
                calendarView.scrollToDate(dateAsMoment, undefined, callback);
            });
        },

        bindToCalendarViewEvents: function(calendarView)
        {
            calendarView.on("scroll:top", this.prependWeekToCalendar, this);
            calendarView.on("scroll:bottom", this.appendWeekToCalendar, this);

            calendarView.on("autoScrollUp", this.autoScrollUp, this);
            calendarView.on("autoScrollDown", this.autoScrollDown, this);
            calendarView.on("cancelAutoScroll", this.cancelAutoScroll, this);

            this.bindToDragMoveAndShiftEvents(calendarView);
        },

        // need to scroll the calendar up - to next week - because we're dragging something off bottom of calendar
        autoScrollUp: function()
        {
            this.autoScroll("autoScrollUpInterval", "onRequestNextWeek");
        },

        // need to scroll the calendar down - back to a previous week - because we're dragging something off top of calendar
        autoScrollDown: function()
        {
            this.autoScroll("autoScrollDownInterval", "onRequestLastWeek");
        },

        autoScroll: function(intervalName, scrollMethodName)
        {
            // already scrolling in this direction
            if (this[intervalName])
                return;

            // else cancel all existing auto scrolls
            this.cancelAutoScroll();
            var self = this;
            var currentWeekModel = this.views.header.model;

            // how long between each week step
            var intervalTime = 700;

            // using animation doesn't work well, because by the time we animate to one we may request another
            var animationSpeed = 0;

            // scroll once, then set interval
            //self[scrollMethodName](currentWeekModel, animationSpeed);
            self[intervalName] = setInterval(function()
            {
                self[scrollMethodName](currentWeekModel, animationSpeed);
            }, intervalTime);

        },

        cancelAutoScroll: function()
        {
            if (this.autoScrollUpInterval)
            {
                clearInterval(this.autoScrollUpInterval);
                this.autoScrollUpInterval = null;
            }

            if (this.autoScrollDownInterval)
            {
                clearInterval(this.autoScrollDownInterval);
                this.autoScrollDownInterval = null;
            }
        },

        onCalendarSelect: function()
        {
            this.views.library.trigger("library:unselect");
        },

        onAthleteChange: function()
        {
            if (theMarsApp.getCurrentController() === this)
            {
                this.trigger("refresh");
            } else
            {
                var newStartDate = this.createStartDay().subtract("weeks", 4);
                var newEndDate = this.createEndDay().add("weeks", 6);
                this.resetCollections(newStartDate, newEndDate);
            }
        }

    };

    // mixins
    _.extend(calendarControllerBase, calendarControllerDragMoveShift);
    _.extend(calendarControllerBase, calendarControllerWeeksCollectionManagement);
    _.extend(calendarControllerBase, calendarControlsHeader);
    _.extend(calendarControllerBase, calendarLibrary);

    // make it a TP.Controller
    return PageContainerController.extend(calendarControllerBase);
});