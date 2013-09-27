define(
[
    "setImmediate",
    "underscore",
    "moment",
    "TP",
    "hbs!quickview/templates/qvShellTemplate"
],
function(
    setImmediate,
    _,
    moment,
    TP,
    qvShellTemplate
)
{

    var QVShellView = TP.ItemView.extend({

        constructor: function(options)
        {
            this.originalModel = options.model;
            options.model = options.model.clone();
            TP.ItemView.apply(this, arguments);
            this.on("render", this._onRenderShell, this);
            this.children = new Backbone.ChildViewContainer();
        },

        template:
        {
            template: qvShellTemplate,
            type: "handlebars"
        },

        modal:
        {
            mask: true,
            shadow: true
        },

        events:
        {
            "click .closeIcon": "close",
            "click .date": "_onDateClicked",
            "click .okButton": "saveAndClose",
            "change .timeInput": "_onTimeChanged"
        },

        closeOnResize: false,

        className: "qvShell",

        showThrobbers: false,

        saveAndClose: function()
        {
            var promise = this.originalModel.save(this.model.attributes, { wait: true });
            promise.then(_.bind(this.close, this));
        },

        serializeData: function()
        {
            var data = QVShellView.__super__.serializeData.apply(this, arguments);

            data.activityDate = this.model.getCalendarDay();
            data.activityTime = this.model.getTimestamp();

            return data;
        },

        _onRenderShell: function()
        {
            this.$(".timeInput").timepicker({ appendTo: this.$el, timeFormat: "g:i a" });
            var qvBody = this.$(".QVBody");

            this.children.add(new this.bodyView({ model: this.model, el: qvBody }));

            this.children.call("render");
        },

        onClose: function()
        {
            this.children.call("close");
        },

        _onDateClicked: function()
        {

            var offset = this.$(".date").offset();
            var position = [offset.left, offset.top + this.$(".date").height()];

            var settings = {
                dateFormat: "yy-mm-dd",
                firstDay: theMarsApp.controllers.calendarController.startOfWeekDayIndex
            };

            var widget = this.$(".date").datepicker(
                "dialog",
                this.model.getCalendarDay(),
                _.bind(this._onDateChanged, this),
                settings,
                position
            ).datepicker("widget");

            // hide then show, or else it flashes for some reason
            widget.hide();

            // because jqueryui sets useless values for these ...
            widget.css("z-index", Number(this.$el.css("z-index") + 1));
            widget.css("opacity", 1);

            // animate instead of just show directly, or else it flashes for some reason
            widget.show(100);
        },

        _onDateChanged: function(date)
        {
            this.$(".date").datepicker("hide");
            this.model.setCalendarDay(date);
        },

        _onTimeChanged: function()
        {
            this.model.setTimestamp(this.$(".timeInput").val());
        }

    });

    return QVShellView;

    var WorkoutQuickView =
    {
        modal:
        {
            mask: true,
            shadow: true
        },

        closeOnResize: false,

        className: "qvShell",

        showThrobbers: false,

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

                    self.prefetchConfig.detailsPromise.done(function()
                    {
                        self.trigger("details:fetched");
                    });

                }, 100);

                this.prefetchConfig.workoutDetailDataFetchTimeout = setTimeout(function()
                {
                    self.prefetchConfig.detailDataPromise = self.model.get("detailData").createPromise();

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

            this.tabRendered =
            [
                false,
                false,
                false,
                false,
                false
            ];
            
            this.initializeHeaderActions();
            this.initializeFileUploads();
            this.initializeStickit();
            this.initializeSaveDeleteDiscard();
            this.initializeExpand();
            this.initializeSharing();

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
            if (this.model.get("detailData").attributes.flatSamples !== null)
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

            if (this.model.get("details").get("timeInSpeedZones") !== null || this.model.get("details").get("meanMaxSpeeds") !== null)
            {
                var meanMaxSpeedArray = this.model.get("details").get("meanMaxSpeeds").meanMaxes;
                var hasSpeedValue = this.checkToSeeModelHasValue(meanMaxSpeedArray);

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

                if (hasSpeedValue)
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

            tabViews.hr.on("change:model", this.onDetailsChange, this);

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
            //Show pace for: run/walk/swim/other, show speed for anything else
            var workoutTypeValueId = this.model.get("workoutTypeValueId");

            var showPace = _.contains([1, 3, 13, 100], workoutTypeValueId);
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
            this.model.on("deviceFileUploaded", this.fetchDetailData, this);
            this.on("close", this.stopWatchingFileUploads, this);
            this.setupFileUploadView();
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
