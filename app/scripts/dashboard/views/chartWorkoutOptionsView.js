define(
[
    "jquery",
    "underscore",
    "TP",
    "hbs!dashboard/templates/chartWorkoutOptions"
],
function(
    $,
    _,
    TP,
    chartWorkoutOptionsTemplate
)
{
    var ChartWorkoutOptionsView = TP.ItemView.extend(
    {
        template:
        {
            type: "handlebars",
            template: chartWorkoutOptionsTemplate
        },

        modelEvents: {},

        events:
        {
            "change input.jsWorkoutType": "_onInputsChanged"
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
            var noneSelected = true;

            var workoutTypes = _.map(TP.utils.workout.types.typesById, function(typeName, typeId)
            {
                var isSelected = _.contains(this.model.get("workoutTypeIds"), typeId);

                allSelected = allSelected && isSelected;
                if (isSelected)
                {
                    noneSelected = false;
                }

                return {
                    id: typeId,
                    name: typeName,
                    selected: isSelected
                };
            }, this);    

            workoutTypes.push(
            {
                id: "0",
                name: "All",
                selected: allSelected || noneSelected // if none are selected, then "all" is really selected
            });

            return _.defaults({workoutTypes: workoutTypes}, original);
        },

        _onInputsChanged: function(e)
        {
            var $el = $(e.target);

            if ($el.val() === "0")
            {
                if ($el.is(':checked'))
                {
                    this.$('input.jsWorkoutType[value!="0"]').prop("checked", !($el.is(":checked")));
                }
            }
            else
            {
                this.$('input.jsWorkoutType[value="0"]').prop("checked", !(this.$('input.jsWorkoutType:checked').length));
            }

            this.model.set("workoutTypeIds", _.filter(this.$("input.jsWorkoutType:checked").map(function(i, el) { return $(el).val(); }), function(value) { return value && value !== "0"; }));
        }

    });

    return ChartWorkoutOptionsView;
});
