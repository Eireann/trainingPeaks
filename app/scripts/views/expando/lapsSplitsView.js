define(
[
    "underscore",

    "TP",

    "views/expando/lapSplitView",
    "utilities/lapsStats",

    "hbs!templates/views/expando/lapsSplitsTemplate",
    "hbs!templates/views/expando/lapSplitsTableHeaderTemplate"
],
function(
    _,
    TP, LapSplitView, LapsStats,
    lapsSplitsTemplate,
    lapsSplitsTableHeaderTemplate
    )
{

    var LapsSplitsView = TP.CompositeView.extend(
    {
        podTitle: "Laps & Splits",
        className: "expandoLapsSplitsPod",

        events:
        {
            "change input": "handleChange"
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

            this.on("render", this._afterRender, this);
            this.on("after:item:added", this._afterRender, this);
        },

        renderItemView: function(view, index)
        {
            index = this.collection.sortBy("begin").indexOf(view.model);
            view.lapsStats = this._getLapsStats(view.model);
            view.render();
            var container = this.getItemViewContainer(this);
            this._insertElementAt(container, view.$el, index);
        },

        _insertElementAt: function($container, $element, index)
        {
            if(index === 0)
            {
                $container.prepend($element);
            }
            else if(index >= $container.children().length)
            {
                $container.append($element);
            }
            else 
            {
                $element.insertBefore($container.children()[index]);
            }
        },

        _afterRender: function()
        {
            this._renderTableHeader();
            this._setNoDataClass();
        },

        _renderTableHeader: function()
        {
            if(!this.$(".lapSplitsTableHeader th").length)
            {
                var headers = {
                    headerNames: this._getLapsStats().getHeaders()
                };
                this.$(".lapSplitsTableHeader").html(lapsSplitsTableHeaderTemplate(headers));
            }
        },

        _setNoDataClass: function()
        {
            this.$el.toggleClass("noData", !this.collection.length);
        },

        _getLapsStats: function(lapModel)
        {
            if(!this.lapsStats || !this.lapsStats.columns || !this.lapsStats.columns.length)
            {
                var laps = lapModel ? [lapModel.toJSON()] : this.model.get("detailData").get("lapsStats");
                this.lapsStats = new LapsStats({ model: this.model, laps: laps });
            }

            return this.lapsStats;
        }


    });

    return LapsSplitsView;
});
