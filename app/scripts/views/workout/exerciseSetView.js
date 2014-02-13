define(
[
    "underscore",
    "TP",
    "shared/data/exerciseSetUnits",
    "hbs!templates/views/workout/exerciseSetView"
],
function (
    _,
    TP,
    ExerciseSetUnits,
    exerciseSetView
)
{
    return TP.ItemView.extend(
    {
        className: "exerciseSet",

        template:
        {
            type: "handlebars",
            template: exerciseSetView
        },

        serializeData: function()
        {
            var data = this.model.toJSON();

            data.index = this.options.index + 1;

            data.active = _.find(data.instructions, { name: "Active or Rest" }).planValue;

            data.instructions = _.reject(data.instructions, { name: "Active or Rest" });

            _.each(data.instructions, function(instruction)
            {
                if (instruction.planUnitsSpecified)
                {
                    instruction.units = ExerciseSetUnits[instruction.planUnits];
                }
            })

            return data;
        }
    });
});
