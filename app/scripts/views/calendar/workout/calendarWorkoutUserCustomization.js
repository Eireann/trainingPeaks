define(
[
    "underscore",
    "jquery",
    "TP",
    "utilities/multilineEllipsis",
    "utilities/workout/workoutTypes"
],
function(
         _,
         $,
         TP,
         multilineEllipsis,
         workoutTypes
         )
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

                this.ui.layoutAnchor.before(fields);
            }
        },

        getUserLayoutSettings: function()
        {
            return this.options.workoutLabelLayout || theMarsApp.user.getCalendarSettings().get("workoutLabelLayout");
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
                    fieldValue = this[field.conversion](fieldValue, { workoutTypeValueId: workoutTypeValueId });
                }
                else if(field.units)
                {
                    fieldValue = TP.utils.conversion.formatUnitsValue(field.units, fieldValue, { workoutTypeValueId: workoutTypeValueId });
                }
                var units = field.units ? " " + TP.utils.units.getUnitsLabel(field.units, workoutTypeValueId, this) : "";

                return $("<p>").addClass(field.name).text(prefix + fieldValue + units);
            }
        },

        formatWorkoutType: function(value, options)
        {
            return workoutTypes.getNameById(value);
        },

        formatWorkoutComments: function(commentsArray, options)
        {
            if (commentsArray && commentsArray.length && commentsArray[0].comment)
            {
                return this._multilineEllipsis(commentsArray[0].comment);
            }
            return "";
        },

        formatDescription: function(description)
        {
            return this._multilineEllipsis(description);
        },

        _multilineEllipsis: function(text)
        {
            return multilineEllipsis(text, 100, "...more...");
        }

    };
    return calendarWorkoutUserCustomization;
});
