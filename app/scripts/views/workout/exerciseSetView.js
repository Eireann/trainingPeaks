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

            var activeOrRest = _.find(data.instructions, { name: "Active or Rest" });

            if (activeOrRest)
                data.active = activeOrRest.planValue;

            data.instructions = _.reject(data.instructions, { name: "Active or Rest" });

            _.each(data.instructions, function(instruction)
            {
                // 9 = "HR Zone"
                if (instruction.type === 9)
                {
                    var hrZone = theMarsApp.user.getAthleteSettings().get("heartRateZones.0.zones." + (instruction.planValue - 1));
                    instruction.planValue = hrZone.minimum + " - " + hrZone.maximum;
                }
                // 26 = "Speed Zone"
                else if (instruction.type === 26)
                {
                    var speedZone = theMarsApp.user.getAthleteSettings().get("speedZones.0.zones." + (instruction.planValue - 1));
                    instruction.planValue = TP.utils.conversion.formatUnitsValue("pace", speedZone.minimum) + " - " + TP.utils.conversion.formatUnitsValue("pace", speedZone.maximum);
                }
                // 11 = "Power Zone"
                else if (instruction.type === 11)
                {
                    var powerZone = theMarsApp.user.getAthleteSettings().get("powerZones.0.zones." + (instruction.planValue - 1));
                    instruction.planValue = TP.utils.conversion.formatUnitsValue("power", powerZone.minimum) + " - " + TP.utils.conversion.formatUnitsValue("power", powerZone.maximum);
                }

                if (instruction.planUnitsSpecified)
                {
                    instruction.units = ExerciseSetUnits[instruction.planUnits];
                }
            })

            return data;
        }
    });
});
