define(
[
    "TP"
],
function(
         TP
         )
{
    var ExpandoPodSettingsModel = TP.BaseModel.extend({

        defaults: 
        {
            cols: 1,
            index: 0,
            podType: 0,
            rows: 1
        }
    });

    return ExpandoPodSettingsModel;

});

