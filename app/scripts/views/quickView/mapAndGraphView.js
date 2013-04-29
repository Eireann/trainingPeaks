define(
[
    "TP",
    "views/quickView/mapAndGraph/mapCreator",
    "views/quickView/mapAndGraph/graphCreator",
    "hbs!templates/views/quickView/mapAndGraphView"
],
function (TP, createMapOnContainer, createGraphOnContainer, workoutQuickViewMapAndGraphTemplate)
{
    var mapAndGraphViewBase = 
    {
        className: "mapAndGraph",

        showThrobbers: true,

        template:
        {
            type: "handlebars",
            template: workoutQuickViewMapAndGraphTemplate
        },

        initialize: function()
        {
            _.bindAll(this, "onModelFetched");

            this.mapCreated = false;
        },
        
        onRender: function()
        {
            this.$el.addClass("waiting");
            var modelPromise = this.model.get("detailData").fetch();
            modelPromise.then(this.onModelFetched);
        },
        
        onModelFetched: function()
        {
            this.$el.removeClass("waiting");
            
            if (this.model.get("detailData") === null || this.model.get("detailData").attributes.flatSamples === null)
                return;

            var data = this.parseData();

            createGraphOnContainer(this.$("#quickViewGraph"), data.seriesArray);
            createMapOnContainer("quickViewMap", data.latLongArray);
        },
        
        parseData: function()
        {
            var seriesArray = [];
            var latLongArray = [];

            var samples = this.model.get("detailData").attributes.flatSamples.samples;

            var channelMask = this.model.get("detailData").attributes.flatSamples.channelMask;
            _.each(channelMask, function (channel)
            {
                seriesArray.push({ name: channel, data: []});
            });

            _.each(samples, function (sample)
            {
                var latLong = {};
                for (var i = 0; i < sample.values.length; i++)
                {
                    if (channelMask[i] === "Latitude")
                        latLong.lat = sample.values[i];
                    else if (channelMask[i] === "Longitude")
                        latLong.long = sample.values[i];
                    else if (channelMask[i] === "Distance")
                        continue;
                    else
                        seriesArray[i].data.push([sample.millisecondsOffset, sample.values[i]]);
                }
                latLongArray.push([latLong.lat, latLong.long]);
            });
            
            // Remove Distance/Lat/Long
            var filteredSeriesArray = _.reject(seriesArray, function(seriesItem) {return seriesItem.name === "Distance"})

            return {
                seriesArray: filteredSeriesArray,
                latLongArray: latLongArray
            };
        }
    };

    return TP.ItemView.extend(mapAndGraphViewBase);
});
