define(
[
    "jquery",
    "underscore",
    "TP",
    "shared/views/tomahawkView",
    "utilities/lapsStats"
],
function(
    $,
    _,
    TP,
    TomahawkView,
    LapsStats
)
{

    var LapsSplitsColumnChartSettingsView = TP.ItemView.extend(
    {
        template: _.template(""),

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

        onRender: function()
        {
            var self = this;
            _.each(this.columnNames, function(columnName)
            {
                var column = LapsStats.availableColumns[columnName];
                var enabled = _.contains(self.model.get("columns"), column.id);
                var $label = $("<label/>").text(column.label).appendTo(self.$el);
                var $input = $("<input type='checkbox'>").attr("checked", enabled).prependTo($label);

                $input.click(function(e)
                {
                    if($input.is(":checked"))
                    {
                        self.model.set("columns", _.uniq(self.model.get("columns").concat([column.id])));
                    }
                    else
                    {
                        self.model.set("columns", _.without(self.model.get("columns"), column.id));
                    }
                });
            });
        }
    });

    TomahawkView.wrap(LapsSplitsColumnChartSettingsView);

    return LapsSplitsColumnChartSettingsView;

});
