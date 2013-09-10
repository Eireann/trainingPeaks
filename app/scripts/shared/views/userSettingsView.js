define(
[
    "underscore",
    "TP",
    "backbone",
    "shared/models/userDataSource",
    "shared/views/tabbedLayout",
    "shared/views/overlayBoxView",
    "shared/views/userSettings/userSettingsAccountView",
    "shared/views/userSettings/userSettingsZonesView",
    "views/userConfirmationView",
    "hbs!templates/views/errors/passwordValidationErrorView",
    "hbs!templates/views/errors/emailValidationErrorView",
    "hbs!shared/templates/userSettings/userSettingsFooterTemplate"
],
function(
    _,
    TP,
    Backbone,
    UserDataSource,
    TabbedLayout,
    OverlayBoxView,
    UserSettingsAccountView,
    UserSettingsZonesView,
    UserConfirmationView,
    passwordValidationErrorTemplate,
    emailValidationErrorTemplate,
    userSettingsFooterTemplate
)
{

    var UserSettingsFooterView = TP.ItemView.extend({

        template:
        {
            type: "handlebars",
            template: userSettingsFooterTemplate
        },

        events:
        {
            "click .cancel": "triggerCancel",
            "click .save": "triggerSave"
        },

        triggerCancel: function()
        {
            this.trigger("cancel");
        },

        triggerSave: function()
        {
            this.trigger("save");
        }

    });

    var UserSettingsContentView = TabbedLayout.extend({

        modelEvents: {},

        initialize: function()
        {
            this._initializeNavigation();
            this._initializeFooter();
        },

        _initializeNavigation: function()
        {
            this.navigation =
            [
                {
                    title: "Account",
                    view: UserSettingsAccountView,
                    options:
                    {
                        userModel: this.model,
                        accountSettingsModel: this.model.getAccountSettings(),
                        athleteSettingsModel: this.model.getAthleteSettings(),
                        passwordSettingsModel: this.model.getPasswordSettings(),
                        recurringPaymentsCollection: this.model.getRecurringPaymentsCollection(),
                        paymentHistoryCollection: this.model.getPaymentHistoryCollection()
                    }
                },
                {
                    title: "Zones",
                    view: UserSettingsZonesView,
                    options:
                    {
                        model: this.model
                    }
                }
            ];
        },

        _initializeFooter: function()
        {
            this.footerView = new UserSettingsFooterView();
            this.on("render", this._showFooter, this);
            this.listenTo(this.footerView, "cancel", _.bind(this._cancel, this));
            this.listenTo(this.footerView, "save", _.bind(this._save, this));
        },

        _showFooter: function()
        {
            this.tabbedLayoutFooterRegion.show(this.footerView);
        },

        _save: function()
        {

            if(this.currentView && _.isFunction(this.currentView.applyFormValuesToModels))
            {
                this.currentView.applyFormValuesToModels();
            }

            if(this._validatePassword && this._validateEmail)
            {
                this.$(".tabbedLayoutBody").addClass("waiting");
                var self = this;
                $.when(
                    this._saveUser()
                ).done(
                    function()
                    {
                        self.$(".tabbedLayoutBody").removeClass("waiting");
                    }
                );
            }
        },

        _saveUser: function()
        {
            return UserDataSource.saveUserSettingsAndPassword({
                models: [this.model, this.model.getAthleteSettings(), this.model.getAccountSettings()],
                password: this.model.getPasswordSettings().get("password")
            });
        },

        _cancel: function()
        {
            this.close(); 
        },

        _validatePassword: function()
        {
            var password = this.model.getPasswordSettings().get("password");
            var retypePassword = this.model.getPasswordSettings().get("retypePassword"); 

            if((password || retypePassword) && (password !== retypePassword))
            {
                new UserConfirmationView({ template: passwordValidationErrorTemplate }).render();
                return false;
            }

            return true;
        },

        _validateEmail: function()
        {
            var email = this.model.get("email");
            var validEmail = new RegExp(/^[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,4}$/i);

            if(!validEmail.test(email))
            {
                new UserConfirmationView({ template: emailValidationErrorTemplate }).render();
                return false;
            }

            return true;
        }

    });

    return OverlayBoxView.extend({

        className: "userSettings",
        itemView: UserSettingsContentView
    });

});
