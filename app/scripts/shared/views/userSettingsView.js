define(
[
    "TP",
    "backbone",
    "shared/views/tabbedLayout",
    "shared/views/dialogView",
    "shared/views/userSettings/userSettingsAccountView",
    "shared/views/userSettings/userSettingsZonesView",
],
function(
    TP,
    Backbone,
    TabbedLayout,
    DialogView,
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
                        model: new TP.Model(this.model.getAthleteSettings().get("powerZones"))
                    }
                }
            ];
        }

    });

    return DialogView.extend({

        className: "userSettings",
        itemView: UserSettingsContentView

    });

});
