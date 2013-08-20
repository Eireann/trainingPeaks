define(
[
    "underscore",
    "TP",
    "hbs!dashboard/templates/chartWorkoutOptions"
],
function(
    _,
    TP,
    chartWorkoutOptionsTemplate
)
{
    var ChartWorkoutOptionsView = TP.ItemView.extend({

        template:
        {
            type: "handlebars",
            template: chartWorkoutOptionsTemplate
        },

        modelEvents: {},

        events:
        {
            "change input.workoutType": "_onInputsChanged"
        },

        onRender: function()
        {
            if (_.result(this.model, "isWorkoutTypesLocked"))
            {
                this.$("input").attr("disabled", true);
            }
        },

        serializeData: function()
        {
            var original = ChartWorkoutOptionsView.__super__.serializeData.apply(this, arguments);

            var allSelected = true;

            var workoutTypes = _.map(TP.utils.workout.types.typesById, function(typeName, typeId)
            {
                var isSelected = _.contains(this.model.get("workoutTypeIds"), typeId);

                allSelected = allSelected && isSelected;

                return {
                    id: typeId,
                    name: typeName,
                    selected: isSelected
                };
            }, this);

            workoutTypes.push({
                id: "0",
                name: "Select All",
                selected: allSelected
            });

            return _.defaults({workoutTypes: workoutTypes}, original);
        },

        _onInputsChanged: function(e)
        {
            var $el = $(e.target);

            if ($el.val() === "0")
            {
                this.$("input.workoutType").prop("checked", $el.is(":checked"));
            }
            else
            {
                var allChecked = this.$('input.workoutType[value!="0"]:not(:checked)').length === 0;
                this.$('input.workoutType[value="0"]').prop("checked", allChecked);
            }

            this.model.set("workoutTypeIds", _.filter(this.$("input.workoutType:checked").map(function(i, el) { return $(el).val(); }), function(value) { return value && value !== "0"; }));
        }

    });

    return ChartWorkoutOptionsView;
});
