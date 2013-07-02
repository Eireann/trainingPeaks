define(
[
    "underscore",
    "TP",
    "hbs!templates/views/home/defaultHome"
],
function(
    _,
    TP,
    homeContainerTemplate
    )
{
    var HomeView =
    {
        className: "waiting",

        template:
        {
            type: "handlebars",
            template: homeContainerTemplate
        },

        initialize: function()
        {
            this.on("user:loaded", this.onUserLoaded, this);
        },

        onUserLoaded: function()
        {

        }

    };

    return TP.ItemView.extend(HomeView);
});