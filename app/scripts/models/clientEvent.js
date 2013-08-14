﻿define(
[
    "moment",
    "TP"
],
function (moment, TP)
{
    return TP.APIDeepModel.extend(
    {

        webAPIModelName: "ClientEvent",

        // client events have no id - create only, no updates
        validateIdAttribute: function(){},

        // get person id from session
        defaults: function()
        {
            return {
                DateCreatedEpoch: moment().unix(),
                UserPersonId: theMarsApp.user.has("userId") ? theMarsApp.user.get("userId") : 0,
                UserHost: "",
                UserAgent: "",
                Application: "",
                AppVersion: "",
                Event:
                {
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
                throw new Error("ClientEvent must have Event attribute");
            }
            else {

                var event = this.get('Event');

                if (!event.Label || !event.Type || !event.AppContext)
                    throw new Error("ClientEvent doesn't have all attributes of Event defined");
            }
        }
    });
});