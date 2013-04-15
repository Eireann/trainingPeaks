define(
[
    "underscore",
    "utilities/workoutLayoutFormatter",
    "utilities/getKeyStatField"
],
function(_, workoutLayoutFormatter, getKeyStatField)
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
                var keyStatFieldName = getKeyStatField(this.model);
                _.each(layoutPreferences, function(layoutPreferenceId, index)
                {
                    var field = workoutLayoutFormatter.calendarWorkoutLayout[layoutPreferenceId];
                    if (keyStatFieldName !== field)
                    {
                        this.applyFieldLayoutPreference(field);
                    } 
                }, this);
            }
        },

        getUserLayoutSettings: function()
        {
            return theMarsApp.user.get("settings.calendar.workoutLabelLayout");
        },

        applyFieldLayoutPreference: function(field)
        {
            var prefix = field.prefix ? field.prefix + ": " : "";
            var fieldValue = this.model.get(field.name);
            
            if (fieldValue)
            {
                //TODO: wireup formatting of values (specify function name in workoutLayoutFormatter, and refactor value conversion util into separate functions)
                //TODO: create entire list up, then do one insert into main dom
                var element = $("<p>" + prefix + fieldValue + "</p>");
                element.insertBefore(this.ui.layoutAnchor);
            }
        }
    };
    return calendarWorkoutUserCustomization;
});