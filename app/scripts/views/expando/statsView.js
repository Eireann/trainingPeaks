define(
[
    "jquery",
    "underscore",
    "TP",
    "utilities/workout/formatLapData",
    "hbs!templates/views/expando/statsTemplate"
],
function(
    $,
    _,
    TP,
    formatLapData,
    statsTemplate
    )
{
    var expandoStatsView =
    {

        className: "expandoStats",

        template:
        {
            type: "handlebars",
            template: statsTemplate
        },

        initialize: function(options)
        {
            this.stateModel = options.stateModel;

            this.listenTo(this.model.get("detailData"), "change", _.bind(this.render, this));
            this.listenTo(this.stateModel, "change:primaryRange", _.bind(this._onStatsRangeChanged, this));
        },

        reset: function()
        {
            this.selectedRangeData = null;
            this.render();
        },

        onRender: function()
        {
            this.trigger("resize");

            if(this.model.get("detailData").has("channelCuts"))
            {
                this.$el.addClass("disabled");
            }
            else
            {
                this.$el.removeClass("disabled");
            }
        },

        serializeData: function()
        {
            var workoutStatsForRange = this.stateModel.get("primaryRange");
            if(workoutStatsForRange)
            {
                this.selectedRangeData = workoutStatsForRange.toJSON();
            }
            else
            {
                this.selectedRangeData = null;
            }

            var lapData = this.getLapData();
            this.removePremiumFields(lapData);
            lapData = this.mapToMasterFieldSet(lapData);
            formatLapData.calculateTotalAndMovingTime(lapData);
            this.findAvailableMinMaxAvgFieldsInThisLap(lapData);
            this.addCommonWorkoutFields(lapData);
            return lapData;
        },

        getLapData: function()
        {
            if (this.selectedRangeData)
            {
                return this.selectedRangeData;
            }
            else
            {
                var detailData = this.model.get("detailData").toJSON();
                var lapData = detailData.totalStats ? detailData.totalStats : {};
                lapData.name = "Entire Workout";
                return lapData;
            }
        },

        mapToMasterFieldSet: function(lapData)
        {
            // master is the list of all fields on the entire workout or individual laps that contain some data
            var masterFieldSet = this.getAllFieldsThatHaveValues();

            // pruned fields = all master fields plus any fields in lapData that have a value
            var prunedFields = _.extend({}, masterFieldSet);
            _.each(_.keys(lapData), function(key)
            {
                if(this.hasValueForKey(lapData, key))
                {
                    prunedFields[key] = lapData[key];
                }
            }, this);

            return prunedFields;
        },

        getAllFieldsThatHaveValues: function()
        {
            if(!this.allPossibleFields)
            {
                var allPossibleFields = {};

                // put all of our possible stats objects into an array
                var allStats = [];
                allStats.push(this.model.get("detailData").get("totalStats"));
                _.each(this.model.get("detailData").get("lapsStats"), function(lapStats)
                {
                    allStats.push(lapStats);
                });

                // if the stats for any lap has a value for any field, put that field into the master set
                _.each(allStats, function(stats)
                {
                    _.each(_.keys(stats), function(key){
                        if(!allPossibleFields.hasOwnProperty(key) && this.hasValueForKey(stats, key))
                        {
                            allPossibleFields[key] = null;
                        }
                    }, this);
                }, this);

                // add minMaxAvg fields
                this.findAvailableMinMaxAvgFieldsInAnyLap(allPossibleFields);

                // remove premium fields
                this.removePremiumFields(allPossibleFields);

                this.allPossibleFields = allPossibleFields;
            }
            return this.allPossibleFields;
        },

        _onStatsRangeChanged: function(stateModel, range)
        {
            if(!range)
            {
                this.selectedRangeData = null;
                this.stopWaitingForStats();
                this.render();
            }
            else
            {
                this.renderWorkoutStats(range);

                // if it hasn't loaded, watch for changes
                this.stopWaitingForStats();
                if (!range.getState().get("hasLoaded"))
                {
                    this.waitForStats(range);
                }
            }
        },

        renderWorkoutStats: function(workoutStatsForRange)
        {
            // render
            this.selectedRangeData = workoutStatsForRange.toJSON();
            this.render();
        },

        onStatsFetched: function()
        {
            this.renderWorkoutStats(this.waitingFor);
            this.stopWaitingForStats();
        },

        waitForStats: function(workoutStatsForRange)
        {
            this.onWaitStart();
            this.waitingFor = workoutStatsForRange;
            this.waitingFor.once("sync", this.onStatsFetched, this);
        },

        stopWaitingForStats: function()
        {
            if (this.waitingFor)
            {
                this.waitingFor.off("sync", this.onStatsFetched, this);
            }
            this.currentStatsModel = this.waitingFor;
            this.waitingFor = null;
            this.onWaitStop();
        },

        findAvailableMinMaxAvgFieldsInThisLap: function(lapData)
        {

            if (this.hasAnyNonZeroValue(lapData, ["minimumPower", "averagePower", "maximumPower"]))
                lapData.minMaxPower = lapData.minMaxAvg = true;

            if (this.hasAnyNonZeroValue(lapData, ["minimumSpeed", "averageSpeed", "maximumSpeed"]))
                lapData.minMaxSpeed = lapData.minMaxAvg = true;

            if (this.hasAnyNonZeroValue(lapData, ["minimumHeartRate", "averageHeartRate", "maximumHeartRate"]))
                lapData.minMaxHeartRate = lapData.minMaxAvg = true;

            if (this.hasAnyNonZeroValue(lapData, ["minimumCadence", "averageCadence", "maximumCadence"]))
                lapData.minMaxCadence = lapData.minMaxAvg = true;

            if (this.hasAnyValue(lapData, ["minimumElevation", "averageElevation", "maximumElevation"]))
                lapData.minMaxElevation = lapData.minMaxAvg = true;

            if (this.hasAnyValue(lapData, ["minimumTemp", "averageTemp", "maximumTemp"]))
                lapData.minMaxTemp = lapData.minMaxAvg = true;

            if (this.hasAnyValue(lapData, ["minimumTorque", "averageTorque", "maximumTorque"]))
                lapData.minMaxTorque = lapData.minMaxAvg = true;
        },

        findAvailableMinMaxAvgFieldsInAnyLap: function(lapData)
        {
            lapData.minMaxAvg = false;

            if (this.hasAnyKey(lapData, ["minimumPower", "averagePower", "maximumPower"]))
                lapData.minMaxPower = lapData.minMaxAvg = true;

            if (this.hasAnyKey(lapData, ["minimumSpeed", "averageSpeed", "maximumSpeed"]))
                lapData.minMaxSpeed = lapData.minMaxAvg = true;

            if (this.hasAnyKey(lapData, ["minimumHeartRate", "averageHeartRate", "maximumHeartRate"]))
                lapData.minMaxHeartRate = lapData.minMaxAvg = true;

            if (this.hasAnyKey(lapData, ["minimumCadence", "averageCadence", "maximumCadence"]))
                lapData.minMaxCadence = lapData.minMaxAvg = true;

            if (this.hasAnyKey(lapData, ["minimumElevation", "averageElevation", "maximumElevation"]))
                lapData.minMaxElevation = lapData.minMaxAvg = true;

            if (this.hasAnyKey(lapData, ["minimumTemp", "averageTemp", "maximumTemp"]))
                lapData.minMaxTemp = lapData.minMaxAvg = true;

            if (this.hasAnyKey(lapData, ["minimumTorque", "averageTorque", "maximumTorque"]))
                lapData.minMaxTorque = lapData.minMaxAvg = true;
        },

        removePremiumFields: function(lapData)
        {
            if(!theMarsApp.featureAuthorizer.canAccessFeature(theMarsApp.featureAuthorizer.features.ViewGraphRanges))
            {
                _.each(["efficiencyFactor", "speedPulseDecoupling", "powerPulseDecoupling"], function(key)
                {
                    if(lapData.hasOwnProperty(key))
                    {
                        delete lapData[key];
                    }
                });
            }
        },

        hasAnyKey: function(context, keys)
        {
            var keyInContext = _.find(keys, function(key)
            {
                return context.hasOwnProperty(key);
            });

            return keyInContext ? true : false;
        },

        hasAnyValue: function(context, keys)
        {
            var keyWithAValue = _.find(keys, function(key)
            {
                return this.hasValueForKey(context, key);
            }, this);

            return keyWithAValue ? true : false;
        },

        hasValueForKey: function(context, key)
        {
            return !_.isUndefined(context[key]) && !_.isNull(context[key]);
        },

        hasAnyNonZeroValue: function(context, keys)
        {
            var keyWithAValue = _.find(keys, function(key)
            {
                return !_.isUndefined(context[key]) && !_.isNull(context[key]) && Number(context[key]) !== 0;
            });

            return keyWithAValue ? true : false;
        },

        onWaitStart: function()
        {
            if(!this.$throbber)
            {
                var offset = this.$el.parent().offset();
                this.$throbber = $("<div></div>").addClass("expandoStatsThrobber");
                this.$throbber.css("top", offset.top + "px");
                this.$throbber.css("left", offset.left + "px");
                this.$throbber.width(this.$el.parent().width());
                this.$throbber.height(this.$el.parent().height());
                $("body").append(this.$throbber);
            }
        },

        onWaitStop: function()
        {
            if(this.$throbber)
            {
                this.$throbber.remove();
                this.$throbber = null;
            }
        },

        addCommonWorkoutFields: function(lapData)
        {
            lapData.workoutTypeValueId = this.model.get("workoutTypeValueId");
        }

    };

    return TP.ItemView.extend(expandoStatsView);
});
