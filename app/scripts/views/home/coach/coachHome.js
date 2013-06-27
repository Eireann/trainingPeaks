define(
[
    "underscore",
    "TP",
    "views/pageContainer/primaryContainerView",
    "views/home/coach/athleteCollectionView",
    "hbs!templates/views/home/coach/coachHome"
],
function(
    _,
    TP,
    PrimaryContainerView,
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

            // initialize the superclass
            this.constructor.__super__.initialize.call(this);
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

    return PrimaryContainerView.extend(HomeView);
});