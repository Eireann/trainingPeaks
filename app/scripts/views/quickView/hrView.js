define(
[
    "underscore",
    "TP",
    "views/quickView/qvTableAndGraphTabs/timeInZones",
    "views/quickView/qvTableAndGraphTabs/peaks",
    "views/quickView/qvTableAndGraphTabs/stickitBindings",
    "hbs!templates/views/quickView/heartRate/hrTabView"
],
function(
    _,
    TP,
    timeInZonesMixin,
    peaksMixin,
    stickitMixin,
    hrTabTemplate
)
{
    
    var hrViewBase = {

        className: "quickViewHrTab",

        showThrobbers: true,

        template:
        {
            type: "handlebars",
            template: hrTabTemplate
        },

        initialEvents: function()
        {
            this.model.off("change", this.render);
        },

        initialize: function(options)
        {
            this.workoutModel = options.workoutModel;
            this.initializeTimeInZones();
            this.initializePeaks();
            this.initializeStickit();
        },

        getZoneSettingsByWorkoutTypeId: function(zoneSettingName, workoutTypeId)
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
        }

    };

    _.extend(hrViewBase, timeInZonesMixin);
    _.extend(hrViewBase, peaksMixin);
    _.extend(hrViewBase, stickitMixin);
    return TP.ItemView.extend(hrViewBase);
});
