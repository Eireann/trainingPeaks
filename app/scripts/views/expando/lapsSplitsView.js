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
            this.collection = this.model.get('detailData').getRangeCollectionFor("laps");
            this.collection.availableDataChannels = this.model.get("detailData").get("availableDataChannels");
            this.listenTo(this.model.get("detailData"), "change:availableDataChannels", _.bind(this._rebuildTable, this)); // rebuild table, but preserve edits in progress
            this.listenTo(this.model.get("detailData"), "reset", _.bind(this.render, this));
        },

        onShow: function()
        {
            // if model has no laps/splits, tell controller to close this view
            var self = this;
            this.detailDataPromise.done(function()
            {
                if (!self.model.get('detailData').get('lapsStats'))
                {
                    self.close();
                }
            });
        },

        renderItemView: function(view, index)
        {
            view.keyNames = this.keyNames;
            view.workoutDefaults = this.workoutDefaults;
            view.render();
            this.appendHtml(this, view, index);
        },

        serializeData: function()
        {
            var workoutDefaults = LapsStats.getDefaults(this.model),
                buildResults = LapsStats.buildLapObjects(workoutDefaults, this.model.get("detailData").get("availableDataChannels")),
                lapObjects = buildResults[0],
                emptyKeyCounts = buildResults[1],
                compactedLapObjects = LapsStats.compactLapObjects(lapObjects, emptyKeyCounts),
                headerNames;

            headerNames = LapsStats.buildHeaderNames(compactedLapObjects[0]);


            this.workoutDefaults = workoutDefaults;
            this.keyNames =
                _.map(headerNames, function(headerName) {
                    var headerNameArray = headerName.split(' ');
                    return [headerNameArray[0].toLowerCase(), headerNameArray.slice(1).join('')].join('');
                });

            return {
                headerNames: headerNames
            };
        },

        _rebuildTable: function()
        {
            this.collection.availableDataChannels = this.model.get("detailData").get("availableDataChannels");
            this.render();
        }

    });

    return LapsSplitsView;
});
