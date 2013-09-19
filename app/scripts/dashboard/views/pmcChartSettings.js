define(
[
    "jqueryui/spinner",
    "underscore",
    "TP",
    "dashboard/views/chartSettingsView",
    "views/dashboard/dashboardDatePicker",
    "dashboard/views/chartWorkoutOptionsView",
    "hbs!dashboard/templates/pmcChartSettings"
],
function(
    spinner,
    _,
    TP,
    ChartSettingsView,
    DashboardDatePicker,
    ChartWorkoutOptionsView,
    pmcChartSettingsTemplate
    )
{
    var PMCChartSettings = ChartSettingsView.extend({

        className: ChartSettingsView.prototype.className + " pmcChartSettings",

        events: _.extend({}, ChartSettingsView.prototype.events, {
            "change input[type=number]": "onNumberOptionsChanged",
            "blur input[type=number]": "onNumberOptionsChanged",
            "click input[type=checkbox].chartSeriesOption": "onChartSeriesOptionChanged"
        }),

        onRender: function()
        {
            var self = this;
            this._addView(".customSettings", pmcChartSettingsTemplate({}));
            this._addView(".dateOptionsRegion", new DashboardDatePicker({
                model: this.model
            }));
            this._addView(".workoutTypesRegion", new ChartWorkoutOptionsView({
                model: this.model
            }));
            this._updateTitle();
            this.children.call("render");
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
    });

    return PMCChartSettings;

});
