define(
[
    "TP",
    "models/clientEvent"
],
function (TP, ClientEvent)
{
    return TP.Collection.extend(
    {
        model: ClientEvent,

        url: function()
        {
            return theMarsApp.apiRoot + "/clientevents/v1/event";
        },

        logEvent: function(eventData)
        {
            this.create(eventData);
            //theMarsApp.logger.debug("Logged event: " + JSON.stringify(eventData));
        }

    });
});