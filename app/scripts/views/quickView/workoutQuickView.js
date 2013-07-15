define(
[
    "setImmediate",
    "underscore",
    "moment",
    "TP",
    "views/quickView/qvMain/qvStickitBindings",
    "views/quickView/qvMain/qvSaveDeleteDiscard",
    "views/quickView/qvMain/qvHeaderActions",
    "views/quickView/qvMain/qvSharing",
    "views/quickView/qvMain/qvFileUploads",
    "views/quickView/qvMain/qvExpand",
    "views/quickView/summaryView",
    "views/quickView/hrView",
    "views/quickView/powerView",
    "views/quickView/paceView",
    "views/quickView/mapAndGraphView",
    "hbs!templates/views/quickView/workoutQuickView"
],
function(
    setImmediate,
    _,
    moment,
    TP,
    qvStickitBindings,
    qvSaveDeleteDiscard,
    qvHeaderActions,
    qvSharing,
    qvFileUploads,
    qvExpand,
    WorkoutQuickViewSummary,
    WorkoutQuickViewHR,
    WorkoutQuickViewPower,
    WorkoutQuickViewPace,
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

        closeOnResize: false,

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

                // made this faster so we can enable the expand button faster
                this.prefetchConfig.workoutDetailsFetchTimeout = setTimeout(function()
                {
                    self.prefetchConfig.detailsPromise = self.model.get("details").createPromise();

                    // if we don't have a workout, just resolve the deferred to let everything render
                    if (!self.model.get("workoutId"))
                        self.prefetchConfig.detailsPromise.resolve();

                }, 100);

                this.prefetchConfig.workoutDetailDataFetchTimeout = setTimeout(function()
                {
                    self.prefetchConfig.detailDataPromise = self.model.get("detailData").createPromise();

                    // if we don't have a workout, just resolve the deferred to let everything render
                    if (!self.model.get("workoutId"))
                        self.prefetchConfig.detailDataPromise.resolve();

                }, 400);

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
            this.initializeSharing();

            if (!this.model.get("title"))
            {
                this.once("render", this.focusTitle, this);
            }
            
            this.model.on("change:workoutTypeValueId", this.checkShowPaceViews, this);
            this.on("close", function () { this.model.off("change:workoutTypeValueId", this.checkShowPaceViews, this); });
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

                this.watchForFileUploads();
            }
        },

        onDetailsChange: function(detailModel)
        {
            this.trigger("change:details", detailModel);
        },

        initializeTabsAfterRender: function()
        {
            this.on("close", this.closeTabViews, this);

            this.checkShowPaceViews();

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
        
        checkShowPaceViews: function ()
        {
            //Show pace for: run/walk/swim/other
            var workoutTypeValueId = this.model.get("workoutTypeValueId");

            var showPace = _.contains([1, 3, 13, 100], workoutTypeValueId);

            if (!showPace)
                this.$(".paceTab").css("display", "none");
            else
                this.$(".paceTab").css("display", "");
            
            //Move off the pace tab
            if (this.currentTabIndex === 4)
                this.$(".tabNavigation > .summaryTab").click();

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
        },

        watchForFileUploads: function()
        {
            this.model.on("deviceFileUploaded", this.fetchDetailData, this);
            this.on("close", this.stopWatchingFileUploads, this);
        },

        fetchDetailData: function()
        {
            if (!this.model.get("workoutId"))
                return;

            this.model.get("details").fetch();
            this.model.get("detailData").fetch();
        },

        stopWatchingFileUploads: function()
        {
            this.model.off("deviceFileUploaded", this.fetchDetailData, this);
        },

        focusTitle: function()
        {
            var titleField = this.$("#workoutTitleField");
            setImmediate(function()
            {
                titleField.focus();
            });
        }
    };

    _.extend(WorkoutQuickView, qvSaveDeleteDiscard);
    _.extend(WorkoutQuickView, qvHeaderActions);
    _.extend(WorkoutQuickView, qvStickitBindings);
    _.extend(WorkoutQuickView, qvFileUploads);
    _.extend(WorkoutQuickView, qvExpand);
    _.extend(WorkoutQuickView, qvSharing);

    return TP.ItemView.extend(WorkoutQuickView);
});