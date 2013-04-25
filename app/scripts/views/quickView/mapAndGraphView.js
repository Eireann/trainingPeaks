define(
[
    "TP",
    "highcharts",
    "hbs!templates/views/quickView/mapAndGraphView"
],
function (TP, Highcharts, workoutQuickViewMapAndGraphTemplate)
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

            this.$("#quickViewGraph").highcharts(
            {
                chart:
                {
                    type: "line",
                    zoomType: "x",
                    resetZoomEnabled: true,
                    alignTicks: true
                },
                credits:
                {
                    enabled: false
                },
                legend:
                {
                    enabled: true,
                    backgroundColor: '#FFFFFF',
                    layout: "horizontal",
                    verticalAlign: "top",
                    floating: false,
                    align: "center",
                    x: 0,
                    y: 0
                },
                scrollbar:
                {
                    enabled: false
                },
                title:
                {
                    text: "TP Chart"
                },
                yAxis:
                [
                    {
                        title:
                        {
                            text: "Heart Rate"
                        },
                        gridLineWidth: 1,
                        min: 0
                    }
                ],
                series: seriesArray,
                plotOptions:
                {
                    line:
                    {
                        connectNulls: true,
                        turboThreshold: 100
                    },
                    series:
                    {
                        allowPointSelector: true,
                        animation: false,
                        cursor: "pointer",
                        lineWidth: 1,
                        marker:
                        {
                            enabled: false
                        },
                        shadow: false,
                        states:
                        {
                            hover:
                            {
                                enabled: false
                            }
                        },
                        showCheckbox: false
                    }
                }
            });
        }
    };

    return TP.ItemView.extend(mapAndGraphViewBase);
});
