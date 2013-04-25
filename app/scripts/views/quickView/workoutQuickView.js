define(
[
    "jquerySelectBox",
    "underscore",
    "moment",
    "TP",
    "views/quickView/qvMain/qvStickitBindings",
    "views/quickView/qvMain/qvSaveDeleteDiscard",
    "views/quickView/qvMain/qvHeaderActions",
    "views/quickView/qvMain/qvFileUploads",
    "views/quickView/summaryView",
    "views/quickView/mapAndGraphView",
    "hbs!templates/views/quickView/workoutQuickView"
],
function (
    selectBox,
    _,
    moment,
    TP,
    qvStickitBindings,
    qvSaveDeleteDiscard,
    qvHeaderActions,
    qvFileUploads,
    WorkoutQuickViewSummary,
    WorkoutQuickViewMapAndGraph,
    workoutQuickViewTemplate
)
{
    var WorkoutQuickView =
    {
        modal:
        {
            mask: true,
            shadow: true
        },

        today: moment().format(TP.utils.datetime.shortDateFormat),

        className: "workoutQuickView",

        showThrobbers: false,

        // must have an events, even if empty, or else all of our extending won't work right ...
        events:
        {
            "click .tabNavigation > .summaryTab": "onTabNavigationClicked",
            "click .tabNavigation > .heartrateTab": "onTabNavigationClicked",
            "click .tabNavigation > .powerTab": "onTabNavigationClicked",
            "click .tabNavigation > .paceTab": "onTabNavigationClicked",
            "click .tabNavigation > .mapAndGraphTab": "onTabNavigationClicked"
        },

        ui:
        {
            "quickViewContent": "#quickViewContent"
        },

        tabDomIDs:
        [
            "#quickViewSummaryTab",
            "#quickViewHRTab",
            "#quickViewPowerTab",
            "#quickViewSpeedTab",
            "#quickViewMapAndGraphTab"
        ],

        initialize: function(options)
        {
            if (options.isNewWorkout)
            {
                this.isNewWorkout = true;
                this.dayModel = options.dayModel;
            }
            else
            {
                var self = this;

                // Not a new workout, let's pre-fetch WorkoutDetails from the server
                this.workoutDetailsFetchTimeout = setTimeout(function()
                {
                    self.model.get("details").fetch();
                }, 800);

                // Let's also pre-fetch WorkoutDetailData (Samples & Detailed Peaks & Laps),
                // but let's wait a few seconds to avoid fetching the data unless the user
                // stays on the QuickView long enough.
                this.workoutDetailDataFetchTimeout = setTimeout(function()
                {
                    self.model.get("detailData").fetch();
                }, 3000);
                
                this.on("close", this.stopWorkoutDetailsFetch, this);
            }

            this.currentTabIndex = 0;

            this.tabs = [];

            this.tabRendered =
            [
                false,
                false,
                false,
                false,
                false
            ];
            
            this.initializeFileUploads();
            this.initializeStickit();
            this.initializeSaveDeleteDiscard();
            this.initializeHeaderActions();
        },
        
        stopWorkoutDetailsFetch: function ()
        {
            this.off("close", this.stopWorkoutDetailsFetch);
            
            if (this.workoutDetailsFetchTimeout)
                clearTimeout(this.workoutDetailsFetchTimeout);
            
            if (this.workoutDetailDataFetchTimeout)
                clearTimeout(this.workoutDetailDataFetchTimeout);
        },

        template:
        {
            type: "handlebars",
            template: workoutQuickViewTemplate
        },

        onRender: function()
        {
            if (!this.renderInitialized)
            {
                this.initializeTabs();
                this.renderCurrentTab();

                this.renderInitialized = true;
            }
        },

        initializeTabs: function()
        {
            this.tabs =
            [
                new WorkoutQuickViewSummary({ model: this.model, el: this.$(this.tabDomIDs[0]) }),
                null,
                null,
                null,
                new WorkoutQuickViewMapAndGraph({ model: this.model, el: this.$(this.tabDomIDs[4]) })
            ];
        },

        renderCurrentTab: function()
        {
            var tab = this.tabs[this.currentTabIndex];

            // Lazy render the tab, only once
            if (!this.tabRendered[this.currentTabIndex])
            {
                tab.render();
                this.tabRendered[this.currentTabIndex] = true;
            }

            this.ui.quickViewContent.find(".tabContent").hide();
            this.ui.quickViewContent.find(this.tabDomIDs[this.currentTabIndex]).show();
        },
        
        onTabNavigationClicked: function(e)
        {
            if (!e)
                return;

            var tabIndex = parseInt(this.$(e.currentTarget).data("tabindex"));

            if (tabIndex === null || typeof tabIndex === "undefined")
                return;
            
            this.currentTabIndex = tabIndex;
            this.renderCurrentTab();
        }
    };

    _.extend(WorkoutQuickView, qvSaveDeleteDiscard);
    _.extend(WorkoutQuickView, qvHeaderActions);
    _.extend(WorkoutQuickView, qvStickitBindings);
    _.extend(WorkoutQuickView, qvFileUploads);

    return TP.ItemView.extend(WorkoutQuickView);
});