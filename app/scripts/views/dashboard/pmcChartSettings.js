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

        className: DashboardChartSettingsBase.className + " pmcChartSettings",

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
        },

        onNumberOptionsChanged: function(e)
        {
            var inputId = e.target.id;

            var newValue = $(e.target).val();
            var existingValue = this.model.get(inputId);
            var adjustedValue = this.adjustNumericInput(inputId, newValue, existingValue);

            if(adjustedValue === existingValue)
            {
                $(e.target).val(adjustedValue);
            } else
            {
                this.model.set(inputId, adjustedValue);
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
           
            this.model.set(optionId, checked);
        }
    };

    PMCChartSettings = _.extend({}, DashboardChartSettingsBase, PMCChartSettings);
    return TP.ItemView.extend(PMCChartSettings);

});