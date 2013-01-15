define(
[
    "underscore",
    "backbone.marionette",
    "hbs!templates/views/login"
],
function (_, Marionette, loginViewTemplate)
{
    "use strict";
    
    return Marionette.ItemView.extend(
    {
        template:
        {
            type: "handlebars",
            template: loginViewTemplate
        },
        
        ui:
        {
            "usernameInput": "input[name=username]",
            "passwordInput": "input[name=password]",
            "submitBtn": "input[name=Submit]"
        },
            
        initialize: function ()
        {
            _.bindAll(this);
            this.on("authenticate", this.authenticate);
            this.model.bind("change", this.checkAuthResponse);
        },
            
        triggers:
        {
            "click input[name=Submit]": "authenticate"
        },
            
        authenticate: function ()
        {
            var username = this.ui.usernameInput.val();
            var password = this.ui.passwordInput.val();

            this.model.authenticate({ username: username, password: password });
        },
            
        checkAuthResponse: function ()
        {
            if (this.model.get("access_token"))
                this.trigger("authenticated");
        }
    });
});