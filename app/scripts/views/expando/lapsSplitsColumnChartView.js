define(
[
    "underscore",
    "TP",
    "utilities/lapsStats"
],
function(
    _,
    TP,
    LapsStats
)
{

    var LapsSplitsColumnChartView = TP.ItemView.extend(
    {
        className: "expandoLapsSplitsColumnChartPod",
        events:
        {
            "change input": "handleChange"
        },

        template: _.template(""),

        initialize: function(options)
        {
            if (!options.model)
            {
                throw "Model is required for LapsSplitsView";
            }
            this.detailDataPromise = options.detailDataPromise;
            this.stateModel = options.stateModel;

            this.itemViewOptions = _.extend(this.itemViewOptions || {}, { stateModel: options.stateModel });
            
            this.collection = this.model.get('detailData').getRangeCollectionFor("laps");
            this.collection.availableDataChannels = this.model.get("detailData").get("availableDataChannels");
            this.listenTo(this.model.get("detailData"), "reset change:availableDataChannels", _.bind(this.render, this));
        },

        onRender: function()
        {
            this.$el.toggleClass("noData", !this.collection.length);
            setImmediate(_.bind(this._renderChart, this));
        },

        _renderChart: function()
        {
            var laps = new LapsStats({ model: this.model }).processRows();

            this.$el.plot();
        }

    });

    return LapsSplitsColumnChartView;
});
