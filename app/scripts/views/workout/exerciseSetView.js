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

            var notes = _.find(data.instructions, { name: "Notes" });
            if (notes)
            {
                data.planNote = notes.planValue;
                data.actualNote = notes.actualValue;
            }

            data.instructions = _.reject(data.instructions, { name: "Active or Rest" });
            data.instructions = _.reject(data.instructions, { name: "Notes" });

            _.each(data.instructions, function(instruction)
            {
                instruction.name = TP.utils.translate(instruction.name);

                // 24 = "Percent HR"
                if (instruction.type === 24)
                {
                    // Real estate for this label is very limited, so override its content.
                    instruction.name = TP.utils.translate("%max HR");
                    instruction.planUnitsSpecified = false;
                }
                // 9 = "HR Zone"
                else if (instruction.type === 9)
                {
                    if (instruction.planValueSpecified)
                    {
                        var planHrZone = theMarsApp.user.getAthleteSettings().get("heartRateZones.0.zones." + (instruction.planValue - 1));
                        if (planHrZone)
                        {
                            instruction.planValue = planHrZone.minimum + " - " + planHrZone.maximum;
                        }
                    }
                    if (instruction.actualValueSpecified)
                    {
                        var actualHrZone = theMarsApp.user.getAthleteSettings().get("heartRateZones.0.zones." + (instruction.actualValue - 1));
                        if (actualHrZone)
                        {
                            instruction.actualValue = actualHrZone.minimum + " - " + actualHrZone.maximum;
                        }
                    }
                }
                // 26 = "Speed Zone"
                else if (instruction.type === 26)
                {
                    if (instruction.planValueSpecified)
                    {
                        var planSpeedZone = theMarsApp.user.getAthleteSettings().get("speedZones.0.zones." + (instruction.planValue - 1));
                        if (planSpeedZone)
                        {
                            instruction.planValue = TP.utils.conversion.formatUnitsValue("pace", planSpeedZone.minimum) + " - " + TP.utils.conversion.formatUnitsValue("pace", planSpeedZone.maximum);
                        }
                    }
                    if (instruction.actualValueSpecified)
                    {
                        var actualSpeedZone = theMarsApp.user.getAthleteSettings().get("speedZones.0.zones." + (instruction.actualValue - 1));
                        if (actualSpeedZone)
                        {
                            instruction.actualValue = TP.utils.conversion.formatUnitsValue("pace", actualSpeedZone.minimum) + " - " + TP.utils.conversion.formatUnitsValue("pace", actualSpeedZone.maximum);
                        }
                    }
                }
                // 11 = "Power Zone"
                else if (instruction.type === 11)
                {
                    if (instruction.planValueSpecified)
                    {
                        var planPowerZone = theMarsApp.user.getAthleteSettings().get("powerZones.0.zones." + (instruction.planValue - 1));
                        if (planPowerZone)
                        {
                            instruction.planValue = TP.utils.conversion.formatUnitsValue("power", planPowerZone.minimum) + " - " + TP.utils.conversion.formatUnitsValue("power", planPowerZone.maximum);
                        }
                    }
                    if (instruction.actualValueSpecified)
                    {
                        var actualPowerZone = theMarsApp.user.getAthleteSettings().get("powerZones.0.zones." + (instruction.actualValue - 1));
                        if (actualPowerZone)
                        {
                            instruction.actualValue = TP.utils.conversion.formatUnitsValue("power", actualPowerZone.minimum) + " - " + TP.utils.conversion.formatUnitsValue("power", actualPowerZone.maximum);
                        }
                    }
                }

                if (instruction.planUnitsSpecified)
                {
                    instruction.units = ExerciseSetUnits[instruction.planUnits];
                }
            });

            return data;
        }
    });
});
