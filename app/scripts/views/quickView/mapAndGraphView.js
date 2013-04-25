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
        },
        
        onRender: function()
        {
            var data = [];

            var samples = this.model.get("detailData").attributes.flatSamples.samples;

            _.each(samples, function(sample)
            {
                data.push([sample.millisecondOffset, sample.values[3]]);
            });

            this.$("#quickViewGraph").highcharts(
            {
                chart:
                {
                    type: "line"
                },
                title:
                {
                    text: "TP Chart"
                },
                yAxis:
                {
                    title:
                    {
                        text: "Heart Rate"
                    }
                },
                series:
                [
                    {
                        name: "HR",
                        data: data
                    }
                ]
            });
        }
    };

    return TP.ItemView.extend(mapAndGraphViewBase);
});
