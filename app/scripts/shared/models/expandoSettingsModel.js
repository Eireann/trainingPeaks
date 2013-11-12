define(
[
    "underscore",
    "TP",
    "shared/models/expandoPodLayoutModel"
],
function(
         _,
         TP,
         ExpandoPodLayoutModel
         )
{
    var ExpandoSettingsModel = TP.BaseModel.extend(
    {
        // easiest way to get backbone to PUT instead of POST
        isNew: function()
        {
            return false;
        },

        defaults:
        {
            layouts: []
        },

        url: function()
        {
            var expandoSettingsUrl = "users/v1/user/" + theMarsApp.user.id + "/settings/expando";
            return theMarsApp.apiRoot + "/" + expandoSettingsUrl;
        },

        getLayout: function(layoutId)
        {
            var layout = _.find(this.get("layouts"), function(layout)
            {
                return layout.layoutId === layoutId; 
            });

            return layout ? new ExpandoPodLayoutModel(TP.utils.deepClone(layout)) : new ExpandoPodLayoutModel(this._getDefaultLayout(layoutId));
        },

        addOrUpdateLayout: function(layoutToUpdate)
        {
            var layouts = _.filter(this.get("layouts"), function(layout)
            {
                return layout.layoutId !== layoutToUpdate.get("layoutId");
            });

            layouts.push(layoutToUpdate.toJSON());
            this.set("layouts", layouts);
        },

        _getDefaultLayout: function(layoutId)
        {
            var layout = _.find(this._defaultLayouts, function(layout)
            {
                return layout.layoutId === layoutId; 
            });

            if(!layout)
            {
                layout = this._getDefaultLayout(0);
            }

            // return a clone, so we don't modify our default pods by reference
            var clonedLayout = TP.utils.deepClone(layout);
            clonedLayout.layoutId = layoutId;
            return clonedLayout;
        },

        _defaultLayouts: [

            // default for all sport types
            {
                layoutId: 0,
                pods: [
                    {
                        index: 0,
                        podType: 153, // Map
                        cols: 2
                    }, {
                        index: 1,
                        podType: 152, // Graph
                        cols: 2
                    }, {
                        index: 2,
                        podType: 108, // Laps & Splits,
                        cols: 2
                    }
                ]
            }
        ]

    });


    return ExpandoSettingsModel;
});

/*

[
    {
        podType: 153, // Map
        cols: 2
    }, {
        podType: 152, // Graph
        cols: 2
    }, {
        podType: 108, // Laps & Splits,
        cols: 2
    }, {
        podType: 102 // Heart Rate Time In Zones
    }, {
        podType: 118 // Heart Rate Peaks
    }, {
        podType: 101 // Power Time In Zones
    }, {
        podType: 111 // Power Peaks
    }, {
        podType: 122 // Speed Time In Zones
    }, {
        podType: 119 // Speed Peaks
    }, {
        podType: 156, // Scatter Graph
        cols: 2
    }

*/