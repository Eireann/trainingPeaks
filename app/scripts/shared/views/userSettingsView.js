define(
[
    "underscore",
    "TP",
    "backbone",
    "shared/views/tabbedLayout",
    "shared/views/overlayBoxView",
    "shared/views/userSettings/userSettingsAccountView",
    "shared/views/userSettings/userSettingsZonesView",
    "hbs!shared/templates/userSettings/userSettingsFooterTemplate"
],
function(
    _,
    TP,
    Backbone,
    TabbedLayout,
    OverlayBoxView,
    UserSettingsAccountView,
    UserSettingsZonesView,
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
                        accountSettingsModel: this.model.getAccountSettings(),
                        athleteSettingsModel: this.model.getAthleteSettings(),
                        passwordSettingsModel: this.model.getPasswordSettings()
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
            if(this.currentView && _.isFunction(this.currentView.processSave))
            {
                var self = this;
                this.currentView.processSave().done(
                    function()
                    {
                        self.close();
                    }
                );
            }
        },

        _cancel: function()
        {
            alert("Not Implemented");
        }
    });

    return OverlayBoxView.extend({

        className: "userSettings",
        itemView: UserSettingsContentView
    });

});
