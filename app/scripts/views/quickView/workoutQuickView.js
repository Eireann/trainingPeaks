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
    "views/quickView/qvMain/qvExpand",
    "views/quickView/summaryView",
    "views/quickView/hrView",
    "views/quickView/powerView",
    "views/quickView/paceView",
    "views/quickView/mapAndGraphView",
    "views/quickView/expandedView/quickViewExpandedView",
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
    qvExpand,
    WorkoutQuickViewSummary,
    WorkoutQuickViewHR,
    WorkoutQuickViewPower,
    WorkoutQuickViewPace,
    WorkoutQuickViewMapAndGraph,
    expandedView,
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
            "click .tabNavigation > .mapGraphTab": "onTabNavigationClicked"
        },

        ui:
        {
            "tabNavigation": ".tabNavigation",
            "quickViewContent": "#quickViewContent",
            "quickViewContentExpanded": "#quickViewExpandedContent"
        },

        tabDomIDs:
        [
            "#quickViewSummaryTab",
            "#quickViewMapAndGraphTab",
            "#quickViewHRTab",
            "#quickViewPowerTab",
            "#quickViewSpeedTab"
        ],

        initialize: function(options)
        {

            this.prefetchConfig = {};

            if (options.isNewWorkout)
            {
                this.isNewWorkout = true;
                this.dayModel = options.dayModel;
            }
            else
            {
                var self = this;

                this.prefetchConfig.workoutDetailsFetchTimeout = setTimeout(function()
                {
                    self.prefetchConfig.detailsPromise = self.model.get("details").fetch();
                }, 800);

                this.prefetchConfig.workoutDetailDataFetchTimeout = setTimeout(function()
                {
                    self.prefetchConfig.detailDataPromise = self.model.get("detailData").fetch();
                }, 2000);

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
            this.initializeExpand();
        },
        
        stopWorkoutDetailsFetch: function ()
        {
            this.off("close", this.stopWorkoutDetailsFetch);
            
            if (this.prefetchConfig.workoutDetailsFetchTimeout)
                clearTimeout(this.prefetchConfig.workoutDetailsFetchTimeout);

            if (this.prefetchConfig.workoutDetailDataFetchTimeout)
                clearTimeout(this.prefetchConfig.workoutDetailDataFetchTimeout);
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
                this.initializeTabsAfterRender();
                this.renderCurrentTab();

                this.renderInitialized = true;
            }
        },

        onDetailsChange: function(detailModel)
        {
            this.trigger("change:details", detailModel);
        },

        initializeTabsAfterRender: function()
        {
            this.on("close", this.closeTabViews, this);

            var tabViews = {
                summary: new WorkoutQuickViewSummary({ model: this.model, el: this.$(this.tabDomIDs[0]) }),
                map: new WorkoutQuickViewMapAndGraph({ model: this.model, prefetchConfig: this.prefetchConfig, el: this.$(this.tabDomIDs[1]) }),
                hr: new WorkoutQuickViewHR({ model: this.model.get("details"), workoutModel: this.model, el: this.$(this.tabDomIDs[2]) }),
                power: new WorkoutQuickViewPower({ model: this.model.get("details"), workoutModel: this.model, el: this.$(this.tabDomIDs[3]) }),
                pace: new WorkoutQuickViewPace({ model: this.model.get("details"), workoutModel: this.model, el: this.$(this.tabDomIDs[4]) })
            };

            tabViews.hr.on("change:model", this.onDetailsChange, this);

            this.tabs =
            [
                tabViews.summary,
                tabViews.map,
                tabViews.hr,
                tabViews.power,
                tabViews.pace
            ];
        },

        closeTabViews: function()
        {
            _.each(this.tabs, function(tabView)
            {
                tabView.close();
            }, this);
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

            var tabIndex = parseInt(this.$(e.currentTarget).data("tabindex"), 10);

            if (tabIndex === null || typeof tabIndex === "undefined")
                return;

            this.ui.tabNavigation.find("div").removeClass("tabSelected");
            $(e.currentTarget).addClass("tabSelected");

            this.currentTabIndex = tabIndex;
            this.renderCurrentTab();
        }
    };

    _.extend(WorkoutQuickView, qvSaveDeleteDiscard);
    _.extend(WorkoutQuickView, qvHeaderActions);
    _.extend(WorkoutQuickView, qvStickitBindings);
    _.extend(WorkoutQuickView, qvFileUploads);
    _.extend(WorkoutQuickView, qvExpand);

    return TP.ItemView.extend(WorkoutQuickView);
});