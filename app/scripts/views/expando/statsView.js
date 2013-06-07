define(
[
    "TP",
    "./expandoCommon",
    "hbs!templates/views/expando/statsTemplate"
],
function(
    TP,
    expandoCommon,
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

        initialize: function()
        {
            this.on("controller:rangeselected", this.onRangeSelected, this);
            this.on("controller:unselectall", this.onUnSelectAll, this);
            this.watchForControllerResize();
        },

        onRender: function()
        {
            this.trigger("resize");
        },

        serializeData: function()
        {
            var lapData = this.getLapData();
            expandoCommon.calculateTotalAndMovingTime(lapData);
            this.findAvailableMinMaxAvgFields(lapData);
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
        
        onRangeSelected: function (workoutStatsForRange, options, triggeringView)
        {
            if (!options)
                return;
            
            // we're trying to add or remove it from multi selection - don't show it in stats
            if ((options.addToSelection || options.removeFromSelection) && !options.displayStats)
            {
                return;
            }

            this.renderWorkoutStats(workoutStatsForRange);

            // if it hasn't loaded, watch for changes
            this.stopWaitingForStats();
            if (!workoutStatsForRange.hasLoaded)
            {
                this.waitForStats(workoutStatsForRange);
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
            this.waitingFor = null;
            this.onWaitStop();
        },

        findAvailableMinMaxAvgFields: function(lapData)
        {
            lapData.minMaxAvg = false;

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

        hasAnyValue: function(context, keys)
        {
            var keyWithAValue = _.find(keys, function(key)
            {
                return !_.isUndefined(context[key]) && !_.isNull(context[key]);
            });

            return keyWithAValue ? true : false;
        },

        hasAnyNonZeroValue: function(context, keys)
        {
            var keyWithAValue = _.find(keys, function(key)
            {
                return !_.isUndefined(context[key]) && !_.isNull(context[key]) && Number(context[key]) !== 0;
            });

            return keyWithAValue ? true : false;
        },

        watchForControllerResize: function()
        {
            this.on("controller:resize", this.setViewHeight, this);
            this.on("close", function()
            {
                this.off("controller:resize", this.setViewHeight, this);
            }, this);
        },

        setViewHeight: function(containerHeight)
        {
            // assumes that stats view resizes before laps view, because of their ordering in the expandoController
            //this.$el.parent().height(this.$el.outerHeight() + 10);
            this.$el.parent().css("min-height", containerHeight / 2);
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

        onUnSelectAll: function()
        {
            this.selectedRangeData = null;
            this.stopWaitingForStats();
            this.render();
        },

        addCommonWorkoutFields: function(lapData)
        {
            lapData.workoutTypeValueId = this.model.get("workoutTypeValueId");
        }

    };

    return TP.ItemView.extend(expandoStatsView);
});