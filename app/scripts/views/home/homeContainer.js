define(
[
    "underscore",
    "TP",
    "views/pageContainer/primaryContainerView",
    "hbs!templates/views/home/homeContainer"
],
function(
    _,
    TP,
    PrimaryContainerView,
    homeContainerTemplate
    )
{
    var HomeView =
    {
        template:
        {
            type: "handlebars",
            template: homeContainerTemplate
        },

        initialize: function()
        {
            this.on("user:loaded", this.onUserLoaded, this);

            // initialize the superclass
            this.constructor.__super__.initialize.call(this);
        },

        onUserLoaded: function()
        {

        }

    };

    return PrimaryContainerView.extend(HomeView);
});