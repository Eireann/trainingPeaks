define(
[
    "TP",
    "backbone",
    "shared/views/tabbedLayout",
    "shared/views/overlayBoxView",
    "shared/views/userSettings/userSettingsAccountView",
    "shared/views/userSettings/userSettingsZonesView",
],
function(
    TP,
    Backbone,
    TabbedLayout,
    OverlayBoxView,
    UserSettingsAccountView,
    UserSettingsZonesView
)
{

    var UserSettingsContentView = TabbedLayout.extend({

        initialize: function()
        {
            this.navigation =
            [
                {
                    title: "Account",
                    view: UserSettingsAccountView,
                    options:
                    {
                        model: this.model
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
        }

    });

    return OverlayBoxView.extend({

        className: "userSettings",
        itemView: UserSettingsContentView

    });

});
