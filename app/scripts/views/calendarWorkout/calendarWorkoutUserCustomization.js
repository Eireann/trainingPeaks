define(
[
    "utilities/workoutLayoutFormatter"
],
function(workoutLayoutFormatter)
{
    var calendarWorkoutUserCustomization = {

        initializeUserCustomization: function()
        {
            this.on("render", this.userCustomizationOnRender, this);
        },

        userCustomizationOnRender: function()
        {
            this.applyUILayout();
        },

        applyUILayout: function ()
        {
            //remove the "if" condition once defaults are built into api 
            if (theMarsApp.user.get("settings").calendar && theMarsApp.user.get("settings").calendar.workoutLabelLayout)
            {
                var layoutPreferences = theMarsApp.user.get("settings").calendar.workoutLabelLayout;
                var anchor = this.$(".userLayoutAnchor");
                _.each(layoutPreferences, function(layoutPreference, index)
                {
                    var field = workoutLayoutFormatter.calendarWorkoutLayout[layoutPreference];
                    var prefix = field.prefix ? field.prefix + ": " : "";

                    var fieldValue = this.model.get(field.name);
                    if (fieldValue)
                    {
                        //TODO: wireup formatting of values (specify function name in workoutLayoutFormatter)
                        //TODO: need to exclude key stat from showing a second time
                        //TODO: remove hardcoded items from view (title, description)
                        var element = $("<p>" + prefix + fieldValue + "</p>");
                        element.insertBefore(anchor);
                    }
                }, this);
            }
        }

    };

    return calendarWorkoutUserCustomization;

});