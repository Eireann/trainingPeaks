define(
[
    "jquery",
    "underscore",
    "TP",
    "shared/views/multiSelectView",
    "shared/views/tomahawkView",
    "utilities/lapsStats"
],
function(
    $,
    _,
    TP,
    MultiSelectView,
    TomahawkView,
    LapsStats
)
{

    var LapsSplitsColumnChartSettingsView = TP.ItemView.extend(
    {

        modelEvents: {},
        
        template: _.template("<div class='columns'></div><button class='apply'>Apply</button>"),

        columnNames: [
            "duration",
            "movingTime",
            "distance",
            "averageCadence",
            "maximumSpeed",
            "averageSpeed",
            "maximumPower",
            "averagePower",
            "minimumHeartRate",
            "maximumHeartRate",
            "averageHeartRate",
            "elevationGain",
            "elevationLoss",
            "calories"
        ],

        events:
        {
            "click .apply": "_apply"
        },

        initialize: function()
        {
            this.originalModel = this.model;
            this.model = this.model.clone();
        },

        onRender: function()
        {
            var items = _.map(this.columnNames, function(name)
            {
                var column = LapsStats.availableColumns[name];
                return { label: column.label, value: column.id };
            });

            var multiSelectView = new MultiSelectView({
                el: this.$(".columns"),
                model: this.model,
                attribute: "columns",
                items: items
            });

            multiSelectView.render();

            this.on("close", _.bind(multiSelectView.close, multiSelectView));
        },

        onClose: function()
        {
            this._apply();
        },

        _apply: function()
        {
            this.originalModel.set(this.model.attributes);
        }
    });

    TomahawkView.wrap(LapsSplitsColumnChartSettingsView);

    return LapsSplitsColumnChartSettingsView;

});
