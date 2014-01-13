define(
[
    "jquery",
    "underscore",
    "setImmediate",
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
    "views/quickView/speedView",
    "views/quickView/mapAndGraphView",
    "hbs!templates/views/quickView/workoutQuickView"
],
function(
    $,
    _,
    setImmediate,
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
    WorkoutQuickViewSpeed,
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
            "click .tabNavigation > [data-tabindex]": "onTabNavigationClicked"
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
            "#quickViewPaceTab",
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
                    self.prefetchConfig.detailsPromise = self.model.get("details").getFetchPromise();

                    // if we don't have a workout, just resolve the deferred to let everything render
                    if (!self.model.get("workoutId"))
                        self.prefetchConfig.detailsPromise.resolve();

                    self.prefetchConfig.detailsPromise.done(function()
                    {
                        self.trigger("details:fetched");
                    });

                }, 100);

                this.prefetchConfig.workoutDetailDataFetchTimeout = setTimeout(function()
                {
                    self.prefetchConfig.detailDataPromise = self.model.get("detailData").getFetchPromise();

                    // if we don't have a workout, just resolve the deferred to let everything render
                    if (!self.model.get("workoutId"))
                        self.prefetchConfig.detailDataPromise.resolve();

                    self.prefetchConfig.detailDataPromise.done(function()
                    {
                        self.trigger("detailData:fetched");
                    });

                }, 400);

                this.on("close", this.stopWorkoutDetailsFetch, this);
            }

            this.currentTabIndex = 0;

            this.tabs = [];

            this.tabRendered = [];
            
            this.initializeHeaderActions();
            this.initializeFileUploads();
            this.initializeStickit();
            this.initializeSaveDeleteDiscard();
            this.initializeExpand();
            this.initializeSharing(options);

            if (!this.model.get("title"))
            {
                this.once("render", this.focusTitle, this);
            }
            
            this.model.on("change:workoutTypeValueId", this.checkShowPaceViews, this);
            this.on("close", function () { this.model.off("change:workoutTypeValueId", this.checkShowPaceViews, this); });

            this.model.get("detailData").on("changeSensorData", this.onSensorDataChange, this);
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
            theMarsApp.getBodyElement().addClass("qvOpen");
            if (!this.renderInitialized)
            {
                this.initializeTabsAfterRender();
                this.renderCurrentTab();

                this.renderInitialized = true;

                this.watchForFileUploads();
            }

            this.$(".mapGraphTab").addClass("missingData");
            this.$(".heartrateTab").addClass("missingData");
            this.$(".powerTab").addClass("missingData");
            this.$(".paceTab").addClass("missingData");
            this.$(".speedTab").addClass("missingData");

            this.onSensorDataChange();
        },

        onClose: function()
        {
            theMarsApp.getBodyElement().removeClass("qvOpen");
        },

        onDetailsChange: function(detailModel)
        {
            this.trigger("change:details", detailModel);
        },

        onSensorDataChange: function()
        {
            if (this.model.get("detailData").hasSamples())
            {
                this.$(".mapGraphTab").removeClass("missingData");
            }

            if (this.model.get("details").get("meanMaxHeartRates") !== null)
            {
                var heartRateArray = this.model.get("details").get("meanMaxHeartRates").meanMaxes;
                var hasHeartRateValue = this.checkToSeeModelHasValue(heartRateArray);
               
                if (hasHeartRateValue)
                {
                    this.$(".heartrateTab").removeClass("missingData");
                }
            }

            if (this.model.get("details").get("meanMaxPowers") !== null)
            {
                var meanMaxPowerArray = this.model.get("details").get("meanMaxPowers").meanMaxes;
                var hasPowerValue = this.checkToSeeModelHasValue(meanMaxPowerArray);

                if (hasPowerValue)
                {
                    this.$(".powerTab").removeClass("missingData");
                }
            }

            if (this.model.get("details").get("meanMaxSpeeds") !== null)
            {
                var meanMaxSpeedArray = this.model.get("details").get("meanMaxSpeeds").meanMaxes;
                var hasSpeedValue = this.checkToSeeModelHasValue(meanMaxSpeedArray);

                if (hasSpeedValue)
                {
                    this.$(".paceTab").removeClass("missingData");
                    this.$(".speedTab").removeClass("missingData");
                }
            }

            if (this.model.get("details").get("timeInSpeedZones") !== null)
            {
                var speedZonesArray = this.model.get("details").get("timeInSpeedZones").timeInZones;
                var hasSpeedZonesValue = this.checkToSeeSpeedZoneHasSpeed(speedZonesArray);

                if (hasSpeedZonesValue)
                {
                    this.$(".paceTab").removeClass("missingData");
                    this.$(".speedTab").removeClass("missingData");
                }
            }
        },

        checkToSeeModelHasValue: function (modelHasValue)
        {
            var modelValueArray = modelHasValue;
            modelValueArray = _.find(modelValueArray, function (modelValue)
            {
                return modelValue.value !== null;
            });

            return modelValueArray;
        },

        checkToSeeSpeedZoneHasSpeed: function (speedZonesHasSeconds)
        {
            var modelSecondsArray = speedZonesHasSeconds;
            modelSecondsArray = _.find(modelSecondsArray, function (modelSeconds)
            {
                return modelSeconds.seconds > 0;
            });

            return modelSecondsArray;
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
                pace: new WorkoutQuickViewPace({ model: this.model.get("details"), workoutModel: this.model, el: this.$(this.tabDomIDs[4]) }),
                speed: new WorkoutQuickViewSpeed({ model: this.model.get("details"), workoutModel: this.model, el: this.$(this.tabDomIDs[5]) })
            };

            _.each([tabViews.hr, tabViews.power, tabViews.pace, tabViews.speed], function(tabView)
            {
                this.listenTo(tabView, "change:model", _.bind(this.onDetailsChange, this));
            }, this);

            this.tabs =
            [
                tabViews.summary,
                tabViews.map,
                tabViews.hr,
                tabViews.power,
                tabViews.pace,
                tabViews.speed
            ];
        },
        
        checkShowPaceViews: function ()
        {
            //Show pace for: run/walk/swim/row/other, show speed for anything else
            var workoutTypeValueId = this.model.get("workoutTypeValueId");

            var showPace = _.contains([1, 3, 12, 13, 100], workoutTypeValueId);
            var showSpeed = !showPace;

            if (!showPace)
            {
                this.$(".paceTab").css("display", "none");
                this.$(".speedTab").css("display", "");
            }
            else
            {
                this.$(".paceTab").css("display", "");
                this.$(".speedTab").css("display", "none");
            }
            
            //Move off the pace tab
            if (this.currentTabIndex === 4 && !showPace)
            {
                this.$(".tabNavigation > .speedTab").click();
            }
            else if (this.currentTabIndex === 5 && !showSpeed)
            {
                this.$(".tabNavigation > .paceTab").click();
            }

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
            else
            {
                tab.reRender();
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

            TP.analytics("send", { "hitType": "event", "eventCategory": "quickView", "eventAction": "tabNavigationIndex" + tabIndex + "Clicked", "eventLabel": "" });

            this.ui.tabNavigation.find("div").removeClass("tabSelected");
            $(e.currentTarget).addClass("tabSelected");

            this.currentTabIndex = tabIndex;
            this.renderCurrentTab();
        },

        watchForFileUploads: function()
        {
            this.listenTo(this.model, "deviceFileUploaded", _.bind(this.reloadDetailData, this));
            this.setupFileUploadView();
        },

        reloadDetailData: function()
        {
            if (!this.model.get("workoutId"))
                return;

            this.prefetchConfig.detailsPromise = this.model.get("details").getFetchPromise(true);
            this.prefetchConfig.detailDataPromise = this.model.get("detailData").getFetchPromise(true);
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
