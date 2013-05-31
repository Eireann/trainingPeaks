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
        
        onRangeSelected: function (workoutStatsForRange)
        {
            if (workoutStatsForRange)
            {
                this.selectedRangeData = workoutStatsForRange.toJSON();
                this.render();
                if(workoutStatsForRange.hasLoaded)
                {
                    this.$el.removeClass("waiting");
                } else
                {
                    this.$el.addClass("waiting");
                }
            }
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

            if (this.hasAnyValue(lapData, ["elevationMinimum", "elevationAverage", "elevationMaximum"]))
                lapData.minMaxElevation = lapData.minMaxAvg = true;

            if (this.hasAnyValue(lapData, ["tempMin", "tempAvg", "tempMax"]))
                lapData.minMaxTemp = lapData.minMaxAvg = true;

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
        }
    };

    return TP.ItemView.extend(expandoStatsView);
});