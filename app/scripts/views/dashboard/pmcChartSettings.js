define(
[
    "jqueryui/spinner",
    "underscore",
    "TP",
    "./dashboardChartSettingsBase",
    "hbs!templates/views/dashboard/pmcChartSettings"
],
function(
    spinner,
    _,
    TP,
    DashboardChartSettingsBase,
    pmcChartSettingsTemplate
    )
{
    var PMCChartSettings = {

        className: "pmcChartSettings",

        template:
        {
            type: "handlebars",
            template: pmcChartSettingsTemplate
        },

        events: _.extend({}, DashboardChartSettingsBase.events, {
            "click .workoutType input[type=checkbox]": "onWorkoutTypeSelected",
            "change input[type=number]": "onNumberOptionsChanged",
            "blur input[type=number]": "onNumberOptionsChanged",
            "click input[type=checkbox].chartSeriesOption": "onChartSeriesOptionChanged"
        }),

        onWorkoutTypeSelected: function(e)
        {
            this.hasChangedSettings = true;
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
                    workoutTypeIds.push("0");
                }
            } else
            {
                workoutTypeIds = _.clone(this.model.get(this.settingsKey + ".workoutTypeIds"));
                var inList = _.contains(workoutTypeIds, workoutTypeId);

                if (checked && !inList)
                {
                    workoutTypeIds.push(workoutTypeId);
                } else if (!checked && inList)
                {
                    workoutTypeIds = _.without(workoutTypeIds, workoutTypeId);
                }
            }

            if (workoutTypeIds.length === TP.utils.workout.types.typesById.length)
            {
                workoutTypeIds = ["0"];
            }

            this.model.set(this.settingsKey + ".workoutTypeIds", workoutTypeIds);
        },

        onNumberOptionsChanged: function(e)
        {
            var inputId = e.target.id;

            if (e.type !== "blur" && e.type !== "focusout")
            {
                this.focusedInputId = inputId;
            }

            var modelKey = this.settingsKey + "." + inputId;
            var newValue = $(e.target).val();
            var existingValue = this.model.get(modelKey);
            var adjustedValue = this.adjustNumericInput(inputId, newValue, existingValue);

            console.log(inputId + " changed to " + adjustedValue);
            if(adjustedValue === existingValue)
            {
                $(e.target).val(adjustedValue);
            } else
            {
                this.hasChangedSettings = true;
                this.model.set(modelKey, adjustedValue);
            }
        },

        numericRanges: {
            ctlConstant: {
                min: 7,
                max: 200
            },
            ctlStartValue: {
                min: 0,
                max: 500
            },
            atlConstant: {
                min: 1,
                max: 40
            },
            atlStartValue: {
                min: 0,
                max: 500
            }
        },

        adjustNumericInput: function(inputId, newValue, oldValue)
        {
            var numberValue = Number(newValue);

            if(_.isNaN(numberValue))
            {
                return oldValue;
            }

            if(numberValue < this.numericRanges[inputId].min)
            {
                return this.numericRanges[inputId].min;
            }

            if (numberValue > this.numericRanges[inputId].max)
            {
                return this.numericRanges[inputId].max;
            }

            return numberValue;
        },

        onChartSeriesOptionChanged: function(e)
        {
            var checkbox = $(e.target);

            // the current settings are strings, but somehow checkbox.data gives us an int
            var optionId = checkbox.attr("id");
            var checked = checkbox.is(":checked");
           
            this.model.set(this.settingsKey + "." + optionId, checked);
        }

    };

    PMCChartSettings = _.extend({}, DashboardChartSettingsBase, PMCChartSettings);
    return TP.ItemView.extend(PMCChartSettings);

});