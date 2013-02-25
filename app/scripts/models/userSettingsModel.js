define(
[
    "moment",
    "TP"
],
function (moment, TP)
{
    return TP.APIModel.extend(
    {

        webAPIModelName: "UserSettings",
        idAttribute: "userId",
        shortDateFormat: "YYYY-MM-DD",
        timeFormat: "Thh:mm:ss",
        longDateFormat: "YYYY-MM-DDThh:mm:ss",

        defaults:
        {
            userId: ""
        },

        parse: function(response)
        {
            if (!_.isArray(response))
                return {};

            var self = this;
            var parsedJson = {};
            _.each(response, function(settingsByWorkout)
            {
                self.defaults[settingsByWorkout.WorkoutType.Description] = "";
                parsedJson[settingsByWorkout.WorkoutType.Description] = settingsByWorkout;
            });
            return parsedJson;
        },
        
        url: function()
        {
            return theMarsApp.apiRoot + "/WebApiServer/Athletes/V1/" + this.id + "/Settings";
        }
    });
});