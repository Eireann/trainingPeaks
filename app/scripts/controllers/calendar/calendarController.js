// QL: This is really a CalendarPageController, beacuse it does much more than controll the calendar.
// 1. Create collections it cares about 2. Create views and pass them the collections

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
    var calendarControllerBase =
    {
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

            // QL: Probably shouldn't be mixed in to the calendar object itself. Initialize the header and pass in what it needs to control
            this.initializeHeader();
            this.initializeCalendar();
            
            // QL: Calendar should agnostically receive any dropped item. 
            // Layout changes should propogate through the new CalendarPageView
            this.initializeLibrary();

            // QL: this is layout logic and might belong in the layout itself. So this would read this.layout.renderRegions();
            this.showViewsInRegions();

            this.watchClipboard();

            // our parent class PageContainerController needs this to trigger the window resize functionality
            this.trigger("show");

            this.loadDataAfterUserLoads();
        },

        loadDataAfterUserLoads: function()
        {
            var self = this;
            this.loadCalendarData();
            this.loadLibraryData();
        },

        showViewsInRegions: function()
        {
            this.showHeader();
            this.layout.calendarRegion.show(this.views.calendar);
            this.layout.libraryRegion.show(this.views.library);
        },

        loadCalendarData: function(callback)
        {
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

        clearCacheAndRefresh: function(date)
        {
            if (theMarsApp.ajaxCachingEnabled)
                theMarsApp.ajaxCaching.clearCache();

            var currentWeek = date ? moment(date).format(TP.utils.datetime.shortDateFormat) : this.views.calendar.getCurrentWeek();
            // QL: Should be handled by reset, not "resetToDates"
            this.weeksCollection.resetToDates(moment(this.startDate), moment(this.endDate), currentWeek);

            this.loadCalendarData();
        },

        showDate: function(dateAsMoment, duration)
        {
            if (!dateAsMoment)
                return;

            this.views.calendar.scrollToDate(dateAsMoment, duration);

        },

        initializeCalendar: function()
        {
            // QL: Does this need to be a model? Could it be passed into CalendarContainerView as an attribute on that view?
            var weekDaysModel = new TP.Model({ startOfWeekDayIndex: this.startOfWeekDayIndex });
            
            if (this.views.calendar)
                this.views.calendar.close();

            this.views.calendar = new CalendarContainerView({
                model: weekDaysModel, collection: this.weeksCollection,
                calendarHeaderModel: this.models.calendarHeaderModel,
                startOfWeekDayIndex: this.startOfWeekDayIndex,
                firstDate: this.models.calendarHeaderModel.get('currentDay')
            });

            // QL: Should happen in the CalendarContainerView
            this.bindToCalendarViewEvents(this.views.calendar);
            // QL: this can be part of the function in the previous line
            this.views.calendar.on("calendar:select", this.onCalendarSelect, this);
        },

        onRequestToday: function()
        {
            this.showDate(moment());
        },

        onRequestRefresh: function(date, callback)
        {
            this.clearCacheAndRefresh(date);
        },

        bindToCalendarViewEvents: function(calendarView)
        {
            // none of this is being used anymore

            calendarView.on("scroll:top", this.prependWeekToCalendar, this);
            calendarView.on("scroll:bottom", this.appendWeekToCalendar, this);

            calendarView.on("autoScrollUp", this.autoScrollUp, this);
            calendarView.on("autoScrollDown", this.autoScrollDown, this);
            calendarView.on("cancelAutoScroll", this.cancelAutoScroll, this);

            this.bindToDragMoveAndShiftEvents(calendarView);
        },

        onCalendarSelect: function()
        {
            this.views.library.clearSelection();
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
