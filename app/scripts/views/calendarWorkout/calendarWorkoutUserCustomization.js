define(
[
    "underscore",
    "utilities/workoutLayoutFormatter"
],
function(_, workoutLayoutFormatter)
{
    var calendarWorkoutUserCustomization = {

        initializeUserCustomization: function()
        {
            _.extend(this.ui, {
                layoutAnchor: ".userLayoutAnchor"
            });
            this.on("render", this.userCustomizationOnRender, this);
        },

        userCustomizationOnRender: function()
        {
            this.applyUILayout();
        },

        applyUILayout: function ()
        {
            var layoutPreferences = this.getUserLayoutSettings();
            if (layoutPreferences)
            {
                _.each(layoutPreferences, function(layoutPreferenceId, index)
                {
                    this.applyFieldLayoutPreference(layoutPreferenceId);
                }, this);
            }
        },

        getUserLayoutSettings: function()
        {
            return theMarsApp.user.get("settings.calendar.workoutLabelLayout");
        },

        applyFieldLayoutPreference: function(layoutPreferenceId)
        {
            var field = workoutLayoutFormatter.calendarWorkoutLayout[layoutPreferenceId];
            var prefix = field.prefix ? field.prefix + ": " : "";

            var fieldValue = this.model.get(field.name);
            if (fieldValue)
            {
                //TODO: wireup formatting of values (specify function name in workoutLayoutFormatter, and refactor value conversion util into separate functions)
                //TODO: need to exclude key stat from showing a second time
                //TODO: remove hardcoded items from view (title, description)
                var element = $("<p>" + prefix + fieldValue + "</p>");
                element.insertBefore(anchor);
            }
        }

    };

    return calendarWorkoutUserCustomization;

});