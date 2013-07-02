define(
[
    "underscore",
    "TP",
    "views/home/coach/athleteCollectionView",
    "hbs!templates/views/home/coach/coachHome"
],
function(
    _,
    TP,
    AthleteCollectionView,
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
        },

        ui:
        {
            homeContainer: "#homeContainer"
        },

        onRender: function()
        {
            this.athletesCollection = new TP.Collection(theMarsApp.user.get("athletes"));
            this.athletesView = new AthleteCollectionView({ collection: this.athletesCollection });
            this.athletesView.render();
            this.ui.homeContainer.append(this.athletesView.$el);
        }

    };

    return TP.ItemView.extend(HomeView);
});