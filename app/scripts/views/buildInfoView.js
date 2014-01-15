define(
[
    "TP",
    "hbs!templates/views/buildInfoView"
],
function (TP, buildInfoViewTemplate)
{

    return TP.ItemView.extend(
    {
        className: "buildInfo",

        template:
        {
            type: "handlebars",
            template: buildInfoViewTemplate
        },

        events:
        {
            "click .toggle": "toggleInfo"
        },

        toggleInfo: function()
        {
            this.$el.toggleClass("hidden");
        },

        initialize: function()
        {
            this.on("render", this.hideAfterLoading, this);
        },

        hideAfterLoading: function()
        {
            if(this.model.has("apiVersion"))
            {
                var self = this;
                setTimeout(function(){self.$el.addClass("hidden");}, 2000);
                this.off("render", this.hideAfterLoading, this);
            }
        }
    });
});