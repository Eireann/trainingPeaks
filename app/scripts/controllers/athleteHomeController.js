define(
[
    "jquery",
    "underscore",
    "TP",
    "layouts/athleteHomeLayout",
    "views/home/athlete/athleteHomeHeader",
    "views/home/athlete/athleteHomeSummary",
    "views/home/athlete/athleteHomeActivity",
    "views/home/athlete/athleteHomePods"
],
function(
    $,
    _,
    TP,
    AthleteHomeLayout,
    AthleteHomeHeaderView,
    AthleteHomeSummaryView,
    AthleteHomeActivityView,
    AthleteHomePodsView
    )
{
    return TP.Controller.extend(
    {
        views: {},

        initialize: function()
        {
            this.layout = new AthleteHomeLayout();
            this.listenTo(this.layout, "show", _.bind(this.show, this));
            this.listenTo(this.layout, "close", _.bind(this.onLayoutClose, this));
        },

        onLayoutClose: function()
        {
            _.each(this.views, function(view)
            {
                view.close();
            }, this);
        },

        /*
            VERY IMPORTANT :-)
            Create the views on show, not on initialize
            
            1) when you navigate between controllers, all of your view event bindings will be lost (via controller/view close) and you will be a very confused developer
            2) allows us to lazily initialize the controllers as needed
        */
        show: function()
        {
            if (this.layout.isClosed)
            {
                return;
            }

            this.createViews();
            this.displayViews();
        },

        createViews: function()
        {
            this.views.header = new AthleteHomeHeaderView({ model: theMarsApp.user.getAthleteDetails() });
            this.views.summary = new AthleteHomeSummaryView();
            this.views.activity = new AthleteHomeActivityView();
            this.views.pods = new AthleteHomePodsView();
        },

        displayViews: function()
        {
            this.layout.headerRegion.show(this.views.header);
            this.layout.summaryRegion.show(this.views.summary);
            this.layout.activityFeedRegion.show(this.views.activity);
            this.layout.podsRegion.show(this.views.pods);
        }

    });
});
