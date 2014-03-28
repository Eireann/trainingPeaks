define(
[
    "underscore",
    "TP",
    "expando/views/expandoPodView",
    "views/charts/heartRateTimeInZonesChart",
    "views/charts/powerTimeInZonesChart",
    "views/charts/speedTimeInZonesChart",
    "views/charts/heartRatePeaksChart",
    "views/charts/powerPeaksChart",
    "views/charts/speedPeaksChart",
    "views/expando/graphView",
    "views/expando/mapView",
    "views/expando/lapsSplitsView",
    "views/expando/lapsSplitsColumnChartView",
    "views/expando/scatterGraphView",
    "views/expando/dataGridView"
],
function(
    _,
    TP,
    ExpandoPodView,
    HRTimeInZonesChartView,
    PowerTimeInZonesChartView,
    SpeedTimeInZonesChartView,
    HRPeaksChartView,
    PowerPeaksChartView,
    SpeedPeaksChartView,
    GraphView,
    MapView,
    LapsSplitsView,
    LapsSplitsColumnChartView,
    ScatterGraphView,
    DataGridView
)
{

    var viewsByType =
    {
        153: function(options)
        {
            return new MapView(
            {
                model: options.data.workout,
                detailDataPromise: options.data.detailDataPromise,
                stateModel: options.data.stateModel
            });
        },

        152: function(options)
        {
            return new GraphView(
            {
                model: options.data.workout,
                detailDataPromise: options.data.detailDataPromise,
                stateModel: options.data.stateModel
            });
        },

        108: function(options)
        {
            return new LapsSplitsView(
            {
                model: options.data.workout,
                detailDataPromise: options.data.detailDataPromise,
                stateModel: options.data.stateModel
            });
        },

        102: function(options)
        {
            return buildTimeInZonesChartView(HRTimeInZonesChartView, options);
        },

        118: function(options)
        {
            return buildPeaksChartView(HRPeaksChartView, options);
        },

        101: function(options)
        {
            return buildTimeInZonesChartView(PowerTimeInZonesChartView, options);
        },

        111: function(options)
        {
            return buildPeaksChartView(PowerPeaksChartView, options);
        },

        122: function(options)
        {
            return buildTimeInZonesChartView(SpeedTimeInZonesChartView, options);
        },

        119: function(options)
        {
            return buildPeaksChartView(SpeedPeaksChartView, options);
        },

        156: function(options)
        {
            return new ScatterGraphView(
            {
                model: options.data.workout,
                detailDataPromise: options.data.detailDataPromise,
                stateModel: options.data.stateModel
            });
        },

        157: function(options)
        {
            return new DataGridView(
            {
                model: options.data.workout,
                detailDataPromise: options.data.detailDataPromise,
                stateModel: options.data.stateModel
            });
        },

        1081: function(options)
        {
            return new LapsSplitsColumnChartView(
            {
                model: options.data.workout,
                podModel: options.model,
                detailDataPromise: options.data.detailDataPromise,
                stateModel: options.data.stateModel
            });
        }
    };

    function buildTimeInZonesChartView(ViewClass, options)
    {
        var workoutModel = options.data.workout;
        var workoutDetailModel = workoutModel.get("details");
        var workoutTypeId = workoutModel.get("workoutTypeValueId");
        var zoneType = _.contains([1,3,13,12], workoutTypeId) ? "Pace" : "Speed";

        return new ViewClass({
            workoutType: workoutTypeId,
            zoneType: zoneType,
            model: options.data.workout,
            stateModel: options.data.stateModel
        });
    }

    function buildPeaksChartView(ViewClass, options)
    {
        var workoutModel = options.data.workout;
        var workoutDetailModel = workoutModel.get("details");
        var workoutTypeId = workoutModel.get("workoutTypeValueId");
        var peaksType = _.contains([1,3,13,12], workoutTypeId) ? "Pace" : "Speed";

        return new ViewClass({
            workoutType: workoutTypeId,
            peaksType: peaksType,
            model: options.data.workout,
            stateModel: options.data.stateModel
        });
    }

    function buildView(options)
    {
        var ViewClass = viewsByType[options.model.get("podType")];

        var childView = new ViewClass(options);
        var podView = new ExpandoPodView({ model: options.model, childView: childView, sizer: options.sizer });

        return podView;
    }

    return {
        buildView: buildView
    };

});
