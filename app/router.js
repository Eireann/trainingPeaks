define(
[
    "underscore",
    "TP"
],
function (_, TP)
{
    return TP.Router.extend(
    {
        controllers: {},

        initialize: function ()
        {
            theMarsApp.on("api:unauthorized", this.login, this);

            theMarsApp.navRegion.show(theMarsApp.controllers.navigationController.layout);

            var self = this;
            theMarsApp.controllers.loginController.on("login:success",
            function()
            {
                self.navigate("calendar", { trigger: true });
            });
        },

        routes:
        {
            "home": "home",
            "login": "login",
            "calendar": "calendar",
            "": "calendar"  
        },

        home: function ()
        {
            console.log("ROUTE: home");
            var homeview = new TP.View();
            theMarsApp.mainRegion.show(homeview);
        },

        calendar: function ()
        {
            console.log("ROUTE: calendar");

            theMarsApp.mainRegion.show(theMarsApp.controllers.calendarController.getLayout());
        },

        login: function (origin)
        {
            console.log("ROUTE: login");

            theMarsApp.mainRegion.show(theMarsApp.controllers.loginController.getLayout());
        }
    });
});
