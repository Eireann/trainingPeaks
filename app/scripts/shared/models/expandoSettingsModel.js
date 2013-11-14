define(
[
    "underscore",
    "TP",
    "shared/models/expandoPodLayoutModel"
],
function(
         _,
         TP,
         ExpandoPodLayoutModel
         )
{
    var ExpandoSettingsModel = TP.BaseModel.extend(
    {
        // easiest way to get backbone to PUT instead of POST
        isNew: function()
        {
            return false;
        },

        defaults:
        {
            layouts: []
        },

        url: function()
        {
            var expandoSettingsUrl = "users/v1/user/" + theMarsApp.user.id + "/settings/expando";
            return theMarsApp.apiRoot + "/" + expandoSettingsUrl;
        },

        getLayoutForWorkoutType: function(workoutTypeId)
        {
            var layout = this._findLayoutSettingsByWorkoutType(workoutTypeId);

            if(!layout)
            {
                layout = this._findLayoutSettingsByWorkoutType(0);
            }
            
            var model =  layout ? new ExpandoPodLayoutModel(TP.utils.deepClone(layout)) : new ExpandoPodLayoutModel();
            model.set("workoutTypeId", workoutTypeId);
            return model;
        },

        addOrUpdateLayoutForWorkoutType: function(layoutToUpdate)
        {
            var layouts = _.filter(this.get("layouts"), function(layout)
            {
                return layout.workoutTypeId !== layoutToUpdate.get("workoutTypeId");
            });

            layouts.push(layoutToUpdate.toJSON());
            this.set("layouts", layouts);
        },

        _findLayoutSettingsByWorkoutType: function(workoutTypeId)
        {
            return _.find(this.get("layouts"), function(layout)
            {
                return layout.workoutTypeId === workoutTypeId; 
            });
        }

    });


    return ExpandoSettingsModel;
});
