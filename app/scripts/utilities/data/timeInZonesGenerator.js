define(
[
    "underscore"
],
function(_)
{
    var getZoneSettingsByWorkoutTypeId = function(zoneSettingName, workoutTypeId)
    {
        var athleteSettings = theMarsApp.user.getAthleteSettings();
        if (!athleteSettings || !athleteSettings.has(zoneSettingName))
            return null;

        var hrZoneSettings = athleteSettings.get(zoneSettingName);
        if (!hrZoneSettings || !hrZoneSettings.length)
            return null;

        var defaultWorkoutTypeId = 0;
        var workoutTypeSettings = null;
        var defaultWorkoutTypeSettings = null;

        _.each(hrZoneSettings, function(zoneSet)
        {
            if (zoneSet.workoutTypeId === workoutTypeId)
                workoutTypeSettings = zoneSet;

            if (zoneSet.workoutTypeId === defaultWorkoutTypeId)
                defaultWorkoutTypeSettings = zoneSet;

        }, this);

        if (!workoutTypeSettings)
            workoutTypeSettings = defaultWorkoutTypeSettings;

        return workoutTypeSettings;
    };
    
    var buildTimeInZonesFromAthleteSettings = function(metric, zoneSettingName, workoutDetailsModel, workoutModel)
    {
        var workoutTypeId = workoutModel.get("workoutTypeValueId");
        var settings = getZoneSettingsByWorkoutTypeId(zoneSettingName, workoutTypeId);

        if (!settings)
            return null;

        var timeInZones =
        {
            maximum: settings["maximum" + metric],
            resting: settings["resting" + metric],
            threshold: settings.threshold,
            timeInZones: []
        };

        _.each(settings.zones, function(zone)
        {
            timeInZones.timeInZones.push(
            {
                seconds: 0,
                minimum: zone.minimum,
                maximum: zone.maximum,
                label: zone.label
            });
        }, this);

        return timeInZones;
    };

    return function(metric, zoneSettingName, workoutDetailsModel, workoutModel)
    {
        var timeInZones = workoutDetailsModel.get("timeIn" + metric + "Zones");

        if (!timeInZones || !timeInZones.timeInZones || !timeInZones.timeInZones.length)
        {
            timeInZones = buildTimeInZonesFromAthleteSettings(metric, zoneSettingName, workoutDetailsModel, workoutModel);

            if (timeInZones)
                workoutDetailsModel.set("timeIn" + metric + "Zones", timeInZones, { silent: true });
        }

        return timeInZones;
    };
});
