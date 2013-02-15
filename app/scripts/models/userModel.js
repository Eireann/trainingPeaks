define(
[
    "moment",
    "TP"
],
function (moment, TP)
{
    return TP.APIModel.extend(
    {

        webAPIModelName: "User",
        idAttribute: "personId",
        shortDateFormat: "YYYY-MM-DD",
        timeFormat: "Thh:mm:ss",
        longDateFormat: "YYYY-MM-DDThh:mm:ss",

        defaults:
        {
            firstName: "",
            lastName: "",
            personId: "",
            userName: "",
            athleteType: "",
            city: "",
            state: "",
            country: "",
            unitsValue: 0,
            age: null,
            
            settings: [],
            athletes: [] 
        },
        
        url: function()
        {
            return theMarsApp.apiRoot + "/WebApiServer/Users/V1/User";
        }
    });
});