define(
[
    "underscore",
    "TP"
],
function(
    _,
    TP
)
{

    var ZonesSettingsView = TP.ItemView.extend({

        template: _.template("Hello World")

    });

    return ZonesSettingsView;

});
