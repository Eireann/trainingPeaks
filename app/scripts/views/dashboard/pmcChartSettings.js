define(
[
    "underscore",
    "TP",
    "hbs!templates/views/dashboard/pmcChartSettings"
],
function (_, TP, pmcChartSettings)
{
    return TP.ItemView.extend(
    {

        modal: true,
        showThrobbers: false,
        tagName: "div",
        className: "pmcChartSettings",

        template:
        {
            type: "handlebars",
            template: pmcChartSettings
        },

        events:
        {
            "click .workoutType input[type=checkbox]": "onWorkoutTypeSelected"
        },

        onClose: function()
        {
            this.saveSettings();
        },

        saveSettings: function()
        {
            this.trigger("settings:saved");
        },

        serializeData: function()
        {
            var pmcSettings = this.model.toJSON().settings.dashboard.pmc;
            pmcSettings.workoutTypes = [];
            _.each(TP.utils.workout.types.typesById, function(typeName, typeId)
            {
                pmcSettings.workoutTypes.push(
                    {
                        id: typeId,
                        name: typeName,
                        selected: _.contains(pmcSettings.workoutTypeIds, typeId) ? true : false
                    }
                );
            });

            console.log(pmcSettings);
            return pmcSettings;
        },

        onWorkoutTypeSelected: function(e)
        {
            var checkbox = $(e.target);
            var workoutTypeId = checkbox.data("workouttypeid");
            var checked = checkbox.is(":checked");
            
        }

    });
});