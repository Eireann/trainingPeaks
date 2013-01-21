define(
[
    "underscore",
    "backbone.marionette",
    "hbs!templates/views/loginView"
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
        
        /*
         * Marionette specific way to bind DOM elements to JS "ui" elements.
         * The DOM element selected with the selector on the rightside of the
         * equation will be associated with the ui element named this.ui.NAME
         */
        ui:
        {
            "usernameInput": "input[name=username]",
            "passwordInput": "input[name=password]",
            "submitBtn": "input[name=Submit]"
        },
            
        initialize: function ()
        {
            _.bindAll(this);
            
            this.model.on("api:authorization:success", this.onLoginSuccess);
            this.model.on("api:authorization:failure", this.onLoginFailure);
        },
            
        events:
        {
            "click input[name=Submit]": "authenticate"
        },
        
        onLoginSuccess: function()
        {
            this.trigger("login:success");
        },
        
        onLoginFailure: function()
        {
            this.$("#loginInProgressLabel").hide();
            this.$("#loginFailedLabel").show();
        },
            
        authenticate: function ()
        {
            this.$("#loginFailedLabel").hide();
            this.$("#loginInProgressLabel").show();
            
            var username = this.ui.usernameInput.val();
            var password = this.ui.passwordInput.val();

            this.model.authenticate({ username: username, password: password });
        }
    });
});