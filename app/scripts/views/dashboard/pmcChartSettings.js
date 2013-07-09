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

        onRender: function()
        {
            this.model.off("change", this.render);
        },

        onClose: function()
        {
            this.saveSettings();
        },

        saveSettings: function()
        {
            this.model.save();
        },

        serializeData: function()
        {
            var pmcSettings = this.model.has("settings.dashboard.pmc") ? this.model.toJSON().settings.dashboard.pmc : {};
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

            return pmcSettings;
        },

        onWorkoutTypeSelected: function(e)
        {
            var checkbox = $(e.target);

            // the current settings are strings, but somehow checkbox.data gives us an int
            var workoutTypeId = "" + checkbox.data("workouttypeid");
            var checked = checkbox.is(":checked");
            
            var workoutTypeIds = _.clone(this.model.get("settings.dashboard.pmc.workoutTypeIds"));
            var inList = _.contains(workoutTypeIds, workoutTypeId);

            if(checked && !inList)
            {
                workoutTypeIds.push(workoutTypeId);
            } else if(!checked && inList)
            {
                workoutTypeIds = _.without(workoutTypeIds, workoutTypeId);
            }

            this.model.set("settings.dashboard.pmc.workoutTypeIds", workoutTypeIds);
        }

    });
});