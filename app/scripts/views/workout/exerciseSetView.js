define(
[
    "underscore",
    "TP",
    "shared/data/exerciseSetUnits",
    "utilities/workout/workoutTypes",
    "hbs!templates/views/workout/exerciseSetView"
],
function (
    _,
    TP,
    ExerciseSetUnits,
    WorkoutTypes,
    exerciseSetView
)
{
    var pacedWorkoutTypes = [
        WorkoutTypes.typesByName.Swim,
        WorkoutTypes.typesByName.Run,
        WorkoutTypes.typesByName.Walk
    ];

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

            this._extractModeAndNotes(data);

            _.each(data.instructions, _.bind(function(instruction)
            {
                instruction.name = TP.utils.translate(instruction.name);

                if (instruction.planUnitsSpecified)
                {
                    instruction.units = ExerciseSetUnits[instruction.planUnits];
                }

                this._postProcessNamesAndUnits(instruction);
            }, this));

            return data;
        },

        _extractModeAndNotes: function(data)
        {
            // A set is "active" unless it is marked "rest".
            var activeOrRest = _.find(data.instructions, { name: "Active or Rest" });
            if (activeOrRest && activeOrRest.planValue === 2)
                data.active = false;
            else
                data.active = true;

            var notes = _.find(data.instructions, { name: "Notes" });
            if (notes)
            {
                data.planNote = notes.planValue;
                data.actualNote = notes.actualValue;

                if (data.planNote || data.actualNote)
                    data.displayNotes = true;
                else
                    data.displayNotes = false;
            }

            data.instructions = _.reject(data.instructions, { name: "Active or Rest" });
            data.instructions = _.reject(data.instructions, { name: "Notes" });
        },

        _postProcessNamesAndUnits: function(instruction)
        {
            // The backend does not send us what we need to display.
            // Hence make some necessary adjustments here, until the backend knows better.

            // 6 = "Cadence"
            if (instruction.type === 6)
            {
                instruction.units = "rpm";
            }
            // 9 = "HR Zone"
            else if (instruction.type === 9)
            {
                this._convertHeartRateZones(instruction);
            }
            // 11 = "Power Zone"
            else if (instruction.type === 11)
            {
                this._convertPowerZones(instruction);
            }
            // 10 = "Heart Rate"
            else if (instruction.type === 10)
            {
                instruction.name = TP.utils.translate("Heart Rate");
            }
            // 12 = "Power"
            else if (instruction.type === 12)
            {
                instruction.units = "watts";
            }
            // 13 = "Peak Power"
            else if (instruction.type === 13)
            {
                instruction.units = "watts";
            }
            // 20 = "Energy"
            else if (instruction.type === 20)
            {
                instruction.units = "kj";
            }
            // 24 = "Percent HR"
            else if (instruction.type === 24)
            {
                // Real estate for this label is very limited, so override its content.
                // Massage the name to show the unit and use "bpm" in the unit column.
                instruction.name = TP.utils.translate(instruction.units === "%lt HR" ? "%LT HR": instruction.units);
                instruction.units = "bpm";
            }
            // 26 = "Speed Zone"
            else if (instruction.type === 26)
            {
                this._convertSpeedZones(instruction);
            }
        },

        _buildZoneString: function(zone, units, label)
        {
            var min = units ? TP.utils.conversion.formatUnitsValue(units, zone.minimum) : zone.minimum;
            var max = units ? TP.utils.conversion.formatUnitsValue(units, zone.maximum) : zone.maximum;
            return zone.label + " (" + min + " - " + max + (label ? " " + label : "") + ")";
        },

        _convertHeartRateZones: function(instruction)
        {
            if (instruction.planValueSpecified)
            {
                var planHrZone = this._getZone("heartRate", instruction.planValue);
                if (planHrZone)
                {
                    instruction.planValue = this._buildZoneString(planHrZone, "heartrate", "bpm");
                }
            }
            if (instruction.actualValueSpecified)
            {
                var actualHrZone = this._getZone("heartRate", instruction.actualValue);
                if (actualHrZone)
                {
                    instruction.actualValue = this._buildZoneString(actualHrZone, "heartrate", "bpm"); 
                }
            }
        },

        _convertSpeedZones: function(instruction)
        {
            if (instruction.planValueSpecified)
            {
                var planSpeedZone = this._getZone("speed", instruction.planValue);
                if (planSpeedZone)
                {
                    instruction.planValue = this._buildZoneString(planSpeedZone, _.contains(pacedWorkoutTypes, this.options.workoutTypeId) ? "pace" : "speed");
                }
            }
            if (instruction.actualValueSpecified)
            {
                var actualSpeedZone = this._getZone("speed", instruction.actualValue);
                if (actualSpeedZone)
                {
                    instruction.actualValue = this._buildZoneString(actualSpeedZone, _.contains(pacedWorkoutTypes, this.options.workoutTypeId) ? "pace" : "speed");
                }
            }
        },

        _convertPowerZones: function(instruction)
        {
            if (instruction.planValueSpecified)
            {
                var planPowerZone = this._getZone("power", instruction.planValue);
                if (planPowerZone)
                {
                    instruction.planValue = this._buildZoneString(planPowerZone, "power", "watts");
                }
            }
            if (instruction.actualValueSpecified)
            {
                var actualPowerZone = this._getZone("power", instruction.actualValue);
                if (actualPowerZone)
                {
                    instruction.actualValue = this._buildZoneString(actualPowerZone, "power", "watts");
                }
            }
        },

        _getZone: function(zoneType, zoneNumber)
        {
            var zone = this._getZoneBySportType(zoneType, zoneNumber, this.options.workoutTypeId);

            if (!zone)
            {
                zone = this._getZoneBySportType(zoneType, zoneNumber, 0);
            }

            return zone;
        },

        _getZoneBySportType: function(zoneType, zoneNumber, workoutTypeId)
        {
            var zoneSets = theMarsApp.user.getAthleteSettings().get(zoneType + "Zones");

            var zonesForWorkoutType = _.find(zoneSets, function(zoneSet)
            {
                return zoneSet.workoutTypeId === workoutTypeId;
            });

            if (zonesForWorkoutType && zonesForWorkoutType.zones && zonesForWorkoutType.zones.length >= zoneNumber)
            {
                return zonesForWorkoutType.zones[(zoneNumber - 1)];
            }
            else
            {
                return undefined;
            }
        }

    });
});
