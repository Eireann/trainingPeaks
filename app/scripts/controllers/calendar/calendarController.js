// QL: This is really a CalendarPageController, beacuse it does much more than controll the calendar.
// 1. Create collections it cares about 2. Create views and pass them the collections

define(
[
    "jquery",
    "underscore",
    "moment",
    "setImmediate",
    "TP",
    "controllers/pageContainerController",
    "layouts/calendarLayout",
    "models/calendar/calendarDay",
    "views/calendar/calendarHeaderView",
    "views/calendar/container/calendarContainerView",
    "calendar/models/calendarStateModel",

    // **** Library ****
    "models/library/exerciseLibrariesCollection",
    "models/library/trainingPlanCollection",
    "views/calendar/library/libraryView"
],
function(
    $,
    _,
    moment,
    setImmediate,
    TP,
    PageContainerController,
    CalendarLayout,
    CalendarDayModel,
    calendarHeaderView,
    CalendarContainerView,
    CalendarStateModel,

    // **** Library ****
    ExerciseLibrariesCollection,
    TrainingPlanCollection,
    LibraryView
)
{

    var CalendarController = PageContainerController.extend(
    {
        initialize: function(options)
        {

            if(!options || !options.dataManager)
            {
                throw new Error("Calendar Controller requires a data manager");
            }

            if(!options.fullScreenManager)
            {
                throw new Error("Calendar Controller requires a full screen manager");
            }

            if(!options.calendarManager)
            {
                throw new Error("Calendar Controller requires a calendar manager");
            }
            
            this._dataManager = options.dataManager;
            this.calendarManager = options.calendarManager;
            this.fullScreenManager = options.fullScreenManager;

            this.stateModel = new CalendarStateModel();

            this.listenTo(this.stateModel, "change:date", _.bind(this._onChangeDate, this));

            // TODO: split this into a couple different functions 
            this.views = {};

            this.layout = new CalendarLayout();
            this.listenTo(this.layout, "show", _.bind(this.show, this));
            this.listenTo(this.layout, "close", _.bind(this.onLayoutClose, this));

            // call parent constructor
            this.constructor.__super__.initialize.call(this);
        },

        _onChangeDate: function(stateModel, date, options)
        {
            if(options.source !== "scroll")
            {
                this.showDate(date);
            }
        },

        // TODO: Use Backbone.Babysitter
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
            return this.calendarManager.loadActivities(moment().subtract(4, "weeks"), moment().add(3, "weeks"));
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

        showDate: function(dateAsMoment, duration)
        {
            if (!dateAsMoment)
                return;

            this.views.calendar.scrollToDate(dateAsMoment, duration);

        },

        initializeCalendar: function()
        {
            if (this.views.calendar)
                this.views.calendar.close();

            this.views.calendar = new CalendarContainerView({
                stateModel: this.stateModel,
                calendarManager: this.calendarManager,
                collection: this.calendarManager.weeks,
                calendarHeaderModel: this.stateModel,
                firstDate: this.stateModel.get('date')
            });
        },

        // **** LIBRARY ****

        setupLibrary: function()
        {
            if(this.libraryCollections) return;

            this.libraryCollections =
            {
                exerciseLibraries: new ExerciseLibrariesCollection(),
                trainingPlans: new TrainingPlanCollection()
            };
        },

        initializeLibrary: function ()
        {
            this.setupLibrary();

            if (this.views.library)
                this.views.library.close();

            this.views.library = new LibraryView({ collections: this.libraryCollections });
        },

        getExerciseLibraries: function()
        {
            return this.libraryCollections.exerciseLibraries;
        },

        // ***** HEADER CONTROLS

        showHeader: function ()
        {
            this.layout.headerRegion.show(this.views.header);
        },

        initializeHeader: function ()
        {
            if (this.views.header)
                this.views.header.close();
            
            this.views.header = new calendarHeaderView({
                model: this.stateModel,
                fullScreenManager: this.fullScreenManager
            });
        }

    });

    // make it a TP.Controller
    return CalendarController;
});
