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
                DateCreatedEpoch: moment().unix(),
                UserPersonId: theMarsApp.session.has("PersonId") ? theMarsApp.session.get("PersonId") : 0,
                UserHost: null,
                UserAgent: null,
                Event: {
                    Label: "",
                    Type: "",
                    AppContext: "",
                    EventContext: ""
                }
            };
        },

        initialize: function()
        {
            if (!this.has('Event') || !this.get('Event')) {
                throw "ClientEvent must have Event attribute";
            }
            else {

                var event = this.get('Event');

                if (!event.Label || !event.Type || !event.AppContext)
                    throw "ClientEvent doesn't have all attributes of Event defined";
            }
        }
    });
});