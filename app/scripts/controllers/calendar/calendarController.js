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

        initialize: function(options)
        {

            if(!options || !options.dataManager)
            {
                throw new Error("Calendar Controller requires a data manager");
            }

            this._dataManager = options.dataManager;
            this.calendarManager = options.calendarManager || theMarsApp.calendarManager;


            // TODO: split this into a couple different functions 
            this.models = {};
            this.views = {};

            this.startOfWeekDayIndex = 1;

            this.layout = new CalendarLayout();
            this.layout.on("show", this.show, this);
            this.layout.on("close", this.onLayoutClose, this);

            this.on("refresh", this.onRequestRefresh, this);

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

        preload: function()
        {
            this.setupLibrary();
            this.loadDataAfterUserLoads();
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
            
            this.initializeLibrary(); // Here so that the first loadDataAfterUserLoads will grab libraries

            // QL: this is layout logic and might belong in the layout itself. So this would read this.layout.renderRegions();
            this.showViewsInRegions();

            // our parent class PageContainerController needs this to trigger the window resize functionality
            this.trigger("show");

            $.when.apply($, this.loadDataAfterUserLoads()).then(function()
            {
                TP.timeEnd("boot");
                TP.profileEnd("boot");
            });
        },

        loadDataAfterUserLoads: function()
        {
            var self = this;
            var calendarPromises = [this.loadCalendarData()];
            var libraryPromises = this.loadLibraryData();
            return [].concat(calendarPromises, libraryPromises);
        },

        showViewsInRegions: function()
        {
            this.showHeader();
            this.layout.calendarRegion.show(this.views.calendar);
            this.layout.libraryRegion.show(this.views.library);
        },

        loadCalendarData: function()
        {
            var promise = this.calendarManager.loadActivities(moment().subtract(4, "weeks"), moment().add(3, "weeks"));
            return promise;
        },

        loadLibraryData: function()
        {
            var deferreds = [];
            for (var libraryName in this.libraryCollections)
            {
                deferreds.push(this._dataManager.fetchModel(this.libraryCollections[libraryName], { reset: true }));
            }
            return deferreds;
        },

        onPasteEnabled: function()
        {
            theMarsApp.getBodyElement().removeClass('pasteDisabled').addClass('pasteEnabled');
        },

        onPasteDisabled: function()
        {
            theMarsApp.getBodyElement().removeClass('pasteEnabled').addClass('pasteDisabled');
        },

        reset: function(startDate, endDate)
        {

            this.calendarManager.reset();
            this.loadCalendarData();

        },

        clearCacheAndRefresh: function(targetDate)
        {

            if(!targetDate)
            {
                targetDate = this.views.calendar.getCurrentWeek();
            }

            if (theMarsApp.ajaxCachingEnabled)
                theMarsApp.ajaxCaching.clearCache();

            this._dataManager.forceReset();

            this.showDate(targetDate);
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
                model: weekDaysModel, collection: this.calendarManager.weeks,
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
