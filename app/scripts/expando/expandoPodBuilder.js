define(
[
    "TP",
    "expando/views/expandoPodView",
    "utilities/data/timeInZonesGenerator",
    "utilities/data/peaksGenerator",
    "views/charts/heartRateTimeInZonesChart",
    "views/charts/powerTimeInZonesChart",
    "views/charts/speedTimeInZonesChart",
    "views/charts/heartRatePeaksChart",
    "views/charts/powerPeaksChart",
    "views/charts/speedPeaksChart",
    "views/expando/graphView",
    "views/expando/mapView",
    "views/workout/lapsSplitsView"
],
function(
    TP,
    ExpandoPodView,
    timeInZonesGenerator,
    ThePeaksGenerator,
    HRTimeInZonesChartView,
    PowerTimeInZonesChartView,
    SpeedTimeInZonesChartView,
    HRPeaksChartView,
    PowerPeaksChartView,
    SpeedPeaksChartView,
    GraphView,
    MapView,
    LapsSplitsView
)
{

    var viewsByType =
    {
        1: function(options)
        {
            return new MapView(
            {
                model: options.data.workout,
                detailDataPromise: options.data.detailDataPromise,
                dataParser: options.data.dataParser,
                stateModel: options.data.stateModel
            });

        },

        2: function(options)
        {
            return new GraphView(
            {
                model: options.data.workout,
                detailDataPromise: options.data.detailDataPromise,
                dataParser: options.data.dataParser,
                stateModel: options.data.stateModel
            });

        },

        3: function(options)
        {
            return new LapsSplitsView(
            {
                model: options.data.workout,
                detailDataPromise: options.data.detailDataPromise,
                stateModel: options.data.stateModel
            });

        },

        4: function(options)
        {
            var ViewClass, variantName, zonesName;
            switch(options.model.get("variant"))
            {
                case 1:
                    ViewClass = HRTimeInZonesChartView;
                    variantName = "HeartRate";
                    zonesName = "heartRateZones";
                    break;
                case 2:
                    ViewClass = PowerTimeInZonesChartView;
                    variantName = "Power";
                    zonesName = "powerZones";
                    break;
                case 3:
                    ViewClass = SpeedTimeInZonesChartView;
                    variantName = "Speed";
                    zonesName = "speedZones";
                    break;
                default:
                    throw new Error("Unknown Pod Vairant: " + model.get("variant"));
            }

            var workoutModel = options.data.workout;
            var workoutDetailModel = workoutModel.get("details");

            var timeInZones = timeInZonesGenerator(
                variantName,
                zonesName, 
                workoutDetailModel,
                workoutModel
            );

            var workoutTypeId = workoutModel.get("workoutTypeValueId");
            var zoneType = _.contains([1,3,13,12], workoutTypeId) ? "Pace" : "Speed";

            return new ViewClass({
                timeInZones: timeInZones,
                workoutType: workoutTypeId,
                zoneType: zoneType,
                model: options.data.workout,
                stateModel: options.data.stateModel
            });
        },

        5: function(options)
        {
            var ViewClass, variantName, zonesName;
            switch(options.model.get("variant"))
            {
                case 1:
                    ViewClass = HRPeaksChartView;
                    variantName = "HeartRate";
                    zonesName = "heartRateZones";
                    break;
                case 2:
                    ViewClass = PowerPeaksChartView;
                    variantName = "Power";
                    zonesName = "powerZones";
                    break;
                case 3:
                    ViewClass = SpeedPeaksChartView;
                    variantName = "Speed";
                    zonesName = "speedZones";
                    break;
                default:
                    throw new Error("Unknown Pod Vairant: " + model.get("variant"));
            }

            var workoutModel = options.data.workout;
            var workoutDetailModel = workoutModel.get("details");

            var peaks = ThePeaksGenerator.generate(variantName, workoutDetailModel);

            var timeInZones = timeInZonesGenerator(
                variantName,
                zonesName, 
                workoutDetailModel,
                workoutModel
            );

            var workoutTypeId = workoutModel.get("workoutTypeValueId");
            var peaksType = _.contains([1,3,13,12], workoutTypeId) ? "Pace" : "Speed";

            return new ViewClass({
                peaks: peaks,
                timeInZones: timeInZones,
                workoutType: workoutTypeId,
                peaksType: peaksType,
                model: options.data.workout,
                stateModel: options.data.stateModel
            });
        }

    };

    function buildView(options)
    {
        var ViewClass = viewsByType[options.model.get("podType")];

        var childView = new ViewClass(options);
        var podView = new ExpandoPodView({ model: options.model, childView: childView });

        return podView;
    }

    return {
        buildView: buildView
    };

});
