define(
[
    "jqueryui/spinner",
    "underscore",
    "TP",
    "views/dashboard/dashboardChartSettingsBase",
    "hbs!templates/views/dashboard/timeInZonesChartSettings"
],
function(
    spinner,
    _,
    TP,
    DashboardChartSettingsBase,
    timeInZonesChartSettingsTemplate
    )
{
    var TimeInZonesChartSettings = {

        className: DashboardChartSettingsBase.className + " timeInZonesChartSettings",

        template:
        {
            type: "handlebars",
            template: timeInZonesChartSettingsTemplate
        },

        events: _.extend({}, DashboardChartSettingsBase.events, {
            "click .workoutType input[type=checkbox]": "onWorkoutTypeSelected"
        }),

        onWorkoutTypeSelected: function(e)
        {
            var workoutTypeIds = [];

            var $target = $(e.target);

            // if 'select all' is checked, just keep 0 id
            if(Number($target.data("workouttypeid")) === 0)
            {
                if($target.is(":checked"))
                {
                    workoutTypeIds.push("0");
                    this.$(".workoutType input[type=checkbox]").prop("checked", true);
                }
                else
                {
                    this.$(".workoutType input[type=checkbox]").prop("checked", false);                   
                }
            } else {

                // read all checkbox states 
                _.each(this.$(".workoutType input[type=checkbox]"), function(checkbox)
                {
                    var $checkbox = $(checkbox);
                    var workoutTypeId = "" + $checkbox.data("workouttypeid");
                    // ignore 0 'select all' is a special case
                    if($checkbox.is(":checked") && Number(workoutTypeId) !== 0)
                    {
                        workoutTypeIds.push(workoutTypeId);
                    }
                });

                if (workoutTypeIds.length === _.keys(TP.utils.workout.types.typesById).length)
                {
                    workoutTypeIds = [0];
                    this.$(".workoutType input[type=checkbox][data-workouttypeid=0]").prop("checked", true);
                }
                else
                {
                    this.$(".workoutType input[type=checkbox][data-workouttypeid=0]").prop("checked", false);
                }
            }

            this.model.set("workoutTypeIds", workoutTypeIds);
        }
    };

    TimeInZonesChartSettings = _.extend({}, DashboardChartSettingsBase, TimeInZonesChartSettings);
    return TP.ItemView.extend(TimeInZonesChartSettings);

});