define(
[
    "jquery",
    "underscore",
    "TP",
    "hbs!templates/views/navigation"
],
function($, _, TP, navigationViewTemplate)
{

    return TP.ItemView.extend(
    {
        template:
        {
            type: "handlebars",
            template: navigationViewTemplate
        },

        events:
        {
            "click label": "onNavigationClicked"
        },

        initialize: function()
        {
            if (!this.model)
                this.model = new TP.Model();
        },

        onRender: function()
        {
            this.onRouteChange(theMarsApp.router.getCurrentRoute());
            this.watchForRouteChange();
        },

        watchForRouteChange: function()
        {
            this.listenTo(theMarsApp.router, "route", _.bind(this.onRouteChange, this));
            this.on("close", this.stopWatchingRouteChange, this);
        },

        stopWatchingRouteChange: function()
        {
            theMarsApp.router.off("route", this.onRouteChange, this);
        },

        onRouteChange: function(route)
        {
            this.model.set("route", route);
        },
        
        onNavigationClicked: function(event)
        {
            var route = $(event.target).attr("class");
            theMarsApp.router.navigate(route, { trigger: true });
        }
    });
});
