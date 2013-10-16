define(
[
    "underscore",

    "TP",

    "models/commands/saveWorkoutDetailData",
    "views/expando/lapSplitView",
    "utilities/lapsStats",

    "hbs!templates/views/expando/lapsSplitsTemplate"
],
function(
    _,
    TP, SaveWorkoutDetailDataCommand, LapSplitView, LapsStats,
    lapsSplitsTemplate
    )
{
    var LapsSplitsView = TP.CompositeView.extend(
    {
        className: "expandoLapsSplitsPod",
        events:
        {
            "click .btnApply": "handleApply"
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

            this.collection = this.model.get('detailData').rangeCollections.laps;
            this.listenTo(this.collection, 'expando:lapEdit', _.bind(this.showApplyButton, this));

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

        // TODO: figure out where this should really live.
        hideApplyButton: function()
        {
            this.$('.btnApply').hide();
        },

        showApplyButton: function()
        {
            this.$('.btnApply').show();
        },

        serializeLapsStats: function()
        {
            var domLapNames = _.map(this.$('td.lap'), function(lap)
                {
                    var $lap = $(lap);
                    var $lapInput = $lap.find('input');

                    return (($lapInput).length > 0) ? $lapInput.val() : $lap.text();
                });

            var lapsStatsArray = _.clone(this.model.get('detailData').get('lapsStats'));
            _.each(lapsStatsArray, function(lapStats, index)
                {
                    lapStats.name = domLapNames[index];
                });
            return lapsStatsArray;
        },

        handleApply: function(e)
        {
            var params =
            {
                lapsStats: this.serializeLapsStats()
            }; // serialize the lap data into lapsStats[]
            var command = new SaveWorkoutDetailDataCommand(params);
            command.workoutId = this.model.get('workoutId');
            command.execute()
                .done(_.bind(this._handleApplyDone, this))
                .fail(_.bind(this._handleApplyFail, this));
        },

        _handleApplyDone: function()
        {
            this.hideApplyButton();
            var lapsArray = this.model.get('detailData').get('lapsStats');
            this.model.get('detailData').rangeCollections.laps.each(function (lap, index)
                {
                    lap.set({name: lapsArray[index].name});
                });
        },

        _handleApplyFail: function()
        {
        },

        serializeData: function()
        {
            var workoutDefaults = LapsStats.getDefaults(this.model),
                buildResults = LapsStats.buildLapObjects(workoutDefaults),
                lapObjects = buildResults[0],
                emptyKeyCounts = buildResults[1],
                compactedLapObjects = LapsStats.compactLapObjects(lapObjects, emptyKeyCounts),
                rowData = [],
                headerNames;

            headerNames = LapsStats.buildHeaderNames(compactedLapObjects[0]);

            rowData = _.map(compactedLapObjects, function(row)
            {
                return _.values(row);
            });

            this.workoutDefaults = workoutDefaults;
            this.keyNames =
                _.map(headerNames, function(headerName) {
                    var headerNameArray = headerName.split(' ');
                    return [headerNameArray[0].toLowerCase(), headerNameArray.slice(1).join('')].join('');
                });

            return {
                headerNames: headerNames,
                rowData: rowData
            };
        }

    });

    return LapsSplitsView;
});
