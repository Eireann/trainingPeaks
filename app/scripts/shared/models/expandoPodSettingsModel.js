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
            heightInRows: 1,
            index: 0,
            podType: 0,
            widthInColumns: 1
        }
    });

    return ExpandoPodSettingsModel;

});

