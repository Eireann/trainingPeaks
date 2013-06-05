define(
[
    "underscore",
    "TP",
    "hbs!templates/views/quickView/shortUrlView"
],
function(
    _,
    TP,
    shortUrlTemplate
    )
{
    return TP.ItemView.extend(
    {
        modal: true,
        tagName: "div",

        className: "shortUrlView",

        events:
        {

        },

        template:
        {
            type: "handlebars",
            template: shortUrlTemplate
        },

        serializeData: function()
        {
            return {
                shortUrl: this.getShortenedUrl()
            };
        },

        getPublicFileViewerUrl: function()
        {
            return theMarsApp.wwwRoot + "/av/" + this.model.get("sharedWorkoutInformationKey");
        },

        getShortenedUrl: function()
        {
            if (!this.model.has("shortUrl"))
            {
                return this.getPublicFileViewerUrl();
            }
            return this.model.get("shortUrl");
        }
    });
});