define(
[
    "moment",
    "TP"
],
function (moment, TP)
{
    return TP.APIModel.extend(
    {

        webAPIModelName: "ClientEvent",

        // client events have no id - create only, no updates
        validateIdAttribute: function(){},

        // get person id from session
        defaults: function()
        {
            return {
                DateCreated: moment().unix(),
                PersonId: theMarsApp.session.has("PersonId") ? theMarsApp.session.get("PersonId") : 0,
                Host: null,
                Event: null
            };
        }

    });
});