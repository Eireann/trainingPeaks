define(
[
    "underscore",
    "TP",
    "hbs!templates/views/loginView"
],
function (_, TP, loginViewTemplate)
{

    return TP.ItemView.extend(
    {
        template:
        {
            type: "handlebars",
            template: loginViewTemplate
        },
        
        /*
         * TP specific way to bind DOM elements to JS "ui" elements.
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
            if (!this.model)
                throw "loginView requires a SessionModel. Aborting";
            
            this.model.on("api:authorization:success", this.onLoginSuccess, this);
            this.model.on("api:authorization:failure", this.onLoginFailure, this);
        },
            
        events:
        {
            "click input[name=Submit]": "authenticate",
            "keypress input[name=username]": "checkForEnter",
            "keypress input[name=password]": "checkForEnter"
        },

        checkForEnter: function(e)
        {
            if (e.keyCode === 13)
                this.authenticate();
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