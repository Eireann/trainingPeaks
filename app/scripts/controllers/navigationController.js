﻿define(
[
    "backbone.marionette",
    
    "layouts/navigationLayout",
    "views/userControlsView",
    "views/navigationView",
    
    "models/session"
],
function(Marionette, NavigationLayout, UserControlsView, NavigationView, theSession)
{
    return Marionette.Controller.extend(
    {
        views: {},
        
        initialize: function(options)
        {
            _.bindAll(this);

            this.layout = new NavigationLayout();

            this.views.userControlsView = new UserControlsView({ model: theSession });
            this.views.navigationView = new NavigationView();
        },
        
        show: function()
        {
            this.layout.userRegion.show(this.views.userControlsView);
            this.layout.navigationRegion.show(this.views.navigationView);
        }
    });
});
