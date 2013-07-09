define(
[
    "underscore",
    "TP",
    "views/dashboard/pmcChartUtils",
    "hbs!templates/views/dashboard/pmcChartSettings"
],
function(
    _,
    TP,
    pmcChartUtils,
    pmcChartSettingsTemplate
    )
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
            template: pmcChartSettingsTemplate
        },

        events:
        {
            "click .workoutType input[type=checkbox]": "onWorkoutTypeSelected"
        },

        onRender: function()
        {
            this.model.off("change", this.render);
            this.model.on("change:settings.dashboard.pmc.*", this.render, this);
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
            pmcSettings = pmcChartUtils.buildPmcParameters(pmcSettings);

            var allSelected = true;
            pmcSettings.workoutTypes = [];
            _.each(TP.utils.workout.types.typesById, function(typeName, typeId)
            {

                var workoutType = {
                    id: typeId,
                    name: typeName,
                    selected: _.contains(pmcSettings.workoutTypeIds, typeId) ? true : false
                };
                pmcSettings.workoutTypes.push(workoutType);

                if(!workoutType.selected)
                {
                    allSelected = false;
                }
            });

            pmcSettings.workoutTypes.push({
                id: 0,
                name: "Select All",
                selected: allSelected ? true : false
            });

            pmcSettings.dateOptions = [];
            var selectedOptionId = Number(pmcSettings.quickDateSelectOption);
            _.each(pmcChartUtils.pmcDateOptions, function(option)
            {
                pmcSettings.dateOptions.push({
                    id: option.id,
                    label: option.label,
                    selected: option.id === selectedOptionId
                });
            });

            return pmcSettings;
        },

        onWorkoutTypeSelected: function(e)
        {
            var checkbox = $(e.target);

            // the current settings are strings, but somehow checkbox.data gives us an int
            var workoutTypeId = "" + checkbox.data("workouttypeid");
            var checked = checkbox.is(":checked");
            
            var workoutTypeIds = [];
          
            // select all
            if (workoutTypeId === "0")
            {
                if(checked)
                {
                     _.each(TP.utils.workout.types.typesById, function(typeName, typeId)
                    {

                         workoutTypeIds.push(typeId);
                     });
                }
            } else
            {
                workoutTypeIds = _.clone(this.model.get("settings.dashboard.pmc.workoutTypeIds"));
                var inList = _.contains(workoutTypeIds, workoutTypeId);

                if (checked && !inList)
                {
                    workoutTypeIds.push(workoutTypeId);
                } else if (!checked && inList)
                {
                    workoutTypeIds = _.without(workoutTypeIds, workoutTypeId);
                }
            }

            this.model.set("settings.dashboard.pmc.workoutTypeIds", workoutTypeIds);
        }

    });
});