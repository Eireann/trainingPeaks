define(
[
],
function()
{
    return function(samples, channelMask)
    {
        var dataByChannel = {};

        var colorByChannel =
        {
            "HeartRate": "#FF0000",
            "Cadence": "#FFA500",
            "Power": "#FF00FF",
            "RightPower": "#FF00FF",
            "Speed": "#3399FF",
            "Elevation": "#306B00",
            "Temperature": "#0A0AFF",
            "Torque": "#BDBDBD"
        };

        var indexByChannel =
        {
            "HeartRate": 1,
            "Cadence": 2,
            "Power": 3,
            "RightPower": 4,
            "Speed": 5,
            "Elevation": 0,
            "Temperature": 6,
            "Torque": 7
        };

        _.each(samples, function(sample)
        {
            var i;
            for (i = 0; i < sample.values.length; i++)
            {
                if (sample.values[i] === 1.7976931348623157e+308)
                    sample.values[i] = null;
            }
        });

        _.each(samples, function(sample)
        {
            var i;
            for (i = 0; i < sample.values.length; i++)
            {
                if (!_.has(dataByChannel, channelMask[i]))
                    dataByChannel[channelMask[i]] = [];

                dataByChannel[channelMask[i]].push([sample.millisecondsOffset, sample.values[i]]);
            }
        });

        // Clean up Elevation channel
        var minElevation = 0;
        var elevationIsAllNegative = true;
        if (_.has(dataByChannel, "Elevation"))
        {
            minElevation = _.min(dataByChannel.Elevation, function(value)
            {
                // Underscore Min considers "null" a valid comparable value and will always return a min of "null"
                // if null is present in the data set, therefore need a quick hack to get around this.
                elevationIsAllNegative = elevationIsAllNegative && (value[1] === null ? true : value[1] < 0);
                return value[1] === null ? 999999999999999 : value[1];
            })[1];
        }

        var seriesArray = [];
        _.each(channelMask, function(channel)
        {
            if (channel === "Distance")
                return;

            if (channel === "Latitude" || channel === "Longitude")
                return;

            if (channel === "Elevation" && elevationIsAllNegative)
                return;

            var type = channel === "Elevation" ? "area" : "spline";

            seriesArray.push(
            {
                color: colorByChannel[channel],
                name: channel,
                data: dataByChannel[channel],
                type: type,
                index: indexByChannel[channel]
            });
        });

        var latLonArray = [];
        if (_.has(dataByChannel, "Latitude") && _.has(dataByChannel, "Longitude") && (dataByChannel.Latitude.length === dataByChannel.Longitude.length))
        {
            for (var i = 0; i < dataByChannel.Latitude.length; i++)
            {
                var lat = dataByChannel.Latitude[i][1];
                var lon = dataByChannel.Longitude[i][1];

                if (_.isNaN(lat) || _.isNaN(lon))
                    continue;

                latLonArray.push([lat, lon]);
            }
        }

        return {
            seriesArray: seriesArray,
            latLonArray: latLonArray,
            minElevation: minElevation
        };
    };
});