define(
[
    "underscore",
    "utilities/workoutLayoutFormatter",
    "utilities/getKeyStatField",
    "utilities/conversion",
    "utilities/printing"
],
function(_, workoutLayoutFormatter, getKeyStatField, conversion, printing)
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
                    if (field && keyStatFieldName !== field.name)
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
                if (field.conversion)
                {
                    fieldValue = conversion[field.conversion](fieldValue);
                }
                var units = field.unitHelper ? " " + printing.printUnitLabel(field.unitHelper, null, this) : "";
                //TODO: create entire list up, then do one insert into main dom
                var element = $("<p>" + prefix + fieldValue + units + "</p>");
                element.insertBefore(this.ui.layoutAnchor);
            }
        }
    };
    return calendarWorkoutUserCustomization;
});