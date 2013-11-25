define(
[
    "underscore",

    "TP",

    "views/expando/lapSplitView",
    "utilities/lapsStats",

    "hbs!templates/views/expando/lapsSplitsTemplate"
],
function(
    _,
    TP, LapSplitView, LapsStats,
    lapsSplitsTemplate
    )
{

    var LapsSplitsView = TP.CompositeView.extend(
    {
        className: "expandoLapsSplitsPod",
        events:
        {
            "change input": "handleChange"
        },

        collectionEvents: {
            "refresh": "render",
            "add": "render"
        },

        itemView: LapSplitView,

        itemViewContainer: '.lapSplitsTableBody',

        template:
        {
            type: "handlebars",
            template: lapsSplitsTemplate
        },

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
            this.listenTo(this.model.get("detailData"), "reset change:availableDataChannels", _.bind(this.render, this));
        },

        onRender: function()
        {
            if(!this.collection.length)
            {
                this.$el.addClass("noData");
            }
            else
            {
                this.$el.removeClass("noData");
            }
        },

        renderItemView: function(view, index)
        {
            view.lapsStats = this.lapsStats;
            view.render();
            this.appendHtml(this, view, index);
        },

        serializeData: function()
        {
            this.lapsStats = new LapsStats({ model: this.model });

            return {
                headerNames: this.lapsStats.getHeaders()
            };
        }

    });

    return LapsSplitsView;
});
