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

        showThrobbers: false,

        template:
        {
            type: "handlebars",
            template: workoutQuickViewMapAndGraphTemplate
        },

        initialize: function()
        {
            _.bindAll(this, "onModelFetched");
            this.modelPromise = this.model.get("detailData").fetch();
        },
        
        onRender: function()
        {
            this.modelPromise.done(this.onModelFetched);
        },
        
        onModelFetched: function()
        {
            if (this.model.get("detailData") === null || this.model.get("detailData").attributes.flatSamples === null)
                return;

            var seriesArray = [];
            var latLongArray = [];

            var samples = this.model.get("detailData").attributes.flatSamples.samples;

            var channelMask = this.model.get("detailData").attributes.flatSamples.channelMask;
            _.each(channelMask, function (channel)
            {
                seriesArray.push({ name: channel, data: [] });
            });

            _.each(samples, function (sample)
            {
                for (var i = 0; i < sample.values.length; i++)
                {
                    seriesArray[i].data.push([sample.millisecondsOffset, sample.values[i]]);
                }
            });

            createGraphOnContainer(this.$("#quickViewGraph"), seriesArray);
            createMapOnContainer(this.$("#quickViewMap"), latLongArray);
        }
    };

    return TP.ItemView.extend(mapAndGraphViewBase);
});
