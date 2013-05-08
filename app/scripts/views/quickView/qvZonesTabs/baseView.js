define(
[
    "underscore",
    "./timeInZones",
    "./peaks",
    "./stickitBindings",
    "hbs!templates/views/quickView/zonesTabView"
],
function(
    _,
    timeInZonesMixin,
    peaksMixin,
    stickitMixin,
    zonesTabTemplate
)
{
    
    var zonesViewBase = {

        template:
        {
            type: "handlebars",
            template: zonesTabTemplate
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

        onInitialRender: function()
        {
            this.off("render", this.onInitialRender, this);
            this.watchForModelChanges();
            this.on("close", this.stopWatchingModelChanges, this);
        },

        // only on full update from server, won't happen on every small stickit change
        reRenderOnChange: function(model, updateData, options)
        {
            if (!options["alreadyRendered" + this.metric + "Tab"])
            {
                this.unstickit();
                this.stickitInitialized = false;
                this.render();
                options["alreadyRendered" + this.metric + "Tab"] = true;
            }
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
    _.extend(zonesViewBase, timeInZonesMixin);
    _.extend(zonesViewBase, peaksMixin);
    _.extend(zonesViewBase, stickitMixin);
    return zonesViewBase;
});
