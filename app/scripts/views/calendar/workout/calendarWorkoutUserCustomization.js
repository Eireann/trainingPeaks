define(
[
    "underscore",
    "TP"
],
function(_, TP)
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
                var fields = _.map(layoutPreferences, function(layoutPreferenceId, index)
                {
                    var field = TP.utils.workout.layoutFormatter.calendarWorkoutLayout[layoutPreferenceId];
                    if (field)
                    {
                        return this.applyFieldLayoutPreference(field);
                    } 
                }, this);

                this.ui.layoutAnchor.before(fields.join(''));
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
            var workoutTypeValueId = this.model.get("workoutTypeValueId");
            
            if (fieldValue) 
            {
                if (field.conversion)
                {
                    fieldValue = TP.utils.conversion[field.conversion](fieldValue, { workoutTypeValueId: workoutTypeValueId });
                }
                var units = field.unitHelper ? " " + TP.utils.units.getUnitsLabel(field.unitHelper, workoutTypeValueId, this) : "";

                return "<p>" + prefix + fieldValue + units + "</p>";
            }
        }
    };
    return calendarWorkoutUserCustomization;
});
