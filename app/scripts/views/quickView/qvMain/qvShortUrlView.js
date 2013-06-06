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
            "click #closeIcon": "close",
            "click #go": "goToUrl",
            "click #shortUrl": "selectAll"
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
        },

        goToUrl: function()
        {
            window.open(this.getShortenedUrl());
        },

        selectAll: function()
        {
            this.$("#shortUrl").select();
        }
    });
});