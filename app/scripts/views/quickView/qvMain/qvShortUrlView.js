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

        getShortenedUrl: function()
        {
            if (this.model)
                return this.model.get("url");

            return null;
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