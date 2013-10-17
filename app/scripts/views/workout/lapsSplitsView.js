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
    TP, SaveWorkoutDetailDataCommand, LapSplitView, lapsStatsMixin,
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


            this.collection = new TP.Collection(this._buildTableData());
            this.listenTo(this.collection, 'expando:lapEdit', _.bind(this.showApplyButton, this));
            this.listenTo(this.model.get("detailData"), "change:availableDataChannels", _.bind(this._rebuildTable, this)); // rebuild table, but preserve edits in progress
            this.listenTo(this.model.get("detailData"), "reset", _.bind(this.render, this));
        },

        // override the default behavior so we can append to the right DOM element
        appendHtml: function(collectionView, itemView, index)
        {
            var $tableData = (index === 0) ? this.$('.lapSplitsTableHeader') : this.$('.lapSplitsTableBody');
            $tableData.append(itemView.el);
        },

        // override the default behavior, set an attribute for the template
        renderItemView: function(view, index)
        {
            view.customTagName = (index === 0) ? 'th' : 'td';
            view.render();
            this.appendHtml(this, view, index);
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
            _.each(this.model.get('detailData').get('lapsStats'), function(lapStats, index)
                {
                    lapStats.name = domLapNames[index];
                });
            return this.model.get('detailData').get('lapsStats');
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
            _.each(this.$('td.lap input'), function(lapInput)
                {
                    var $lapInput = $(lapInput);
                    var value = $lapInput.val();
                    $lapInput.closest('td.lap').text(value).addClass('edit');
                });
        },

        _handleApplyFail: function()
        {
        },

        serializeData: function()
        {
            var workoutDefaults = this._getDefaults(),
                buildResults = this._buildLapObjects(workoutDefaults),
                lapObjects = buildResults[0],
                emptyKeyCounts = buildResults[1],
                compactedLapObjects = this._compactLapObjects(lapObjects, emptyKeyCounts),
                rowData = [],
                headerNames;

            headerNames = _.map(_.keys(compactedLapObjects[0], function(header_name)
                {
                    return TP.utilities.translate(header_name);
                })
            );

            rowData = _.map(compactedLapObjects, function(row)
            {
                return _.values(row);
            });

            return {
                headerNames: headerNames,
                rowData: rowData
            };
        },

        _rebuildTable: function()
        {
            this.serializeLapsStats();
            this.collection.reset(this._buildTableData());
        }
        
    });

    _.extend(LapsSplitsView.prototype, lapsStatsMixin);
    return LapsSplitsView;
});