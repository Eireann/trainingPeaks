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

        ui:
        {
            homeContainer: "#homeContainer"
        },

        initialize: function()
        {
            this.on("user:loaded", this.onUserLoaded, this);
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