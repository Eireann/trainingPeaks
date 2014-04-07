define(
[
    "underscore",
    "TP",
    "layouts/coachHomeLayout",
    "views/home/coach/coachHome"
],
function(
    _,
    TP,
    CoachHomeLayout,
    CoachHomeView
    )
{
    return TP.Controller.extend(
    {
        views: {},

        initialize: function()
        {
            this.layout = new CoachHomeLayout();
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
            this.views.coachHome = new CoachHomeView();
        },

        displayViews: function()
        {
            this.layout.homeRegion.show(this.views.coachHome);
        }

    });
});
