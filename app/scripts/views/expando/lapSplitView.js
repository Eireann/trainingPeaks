define(
[
    "underscore",
    "TP",
    "utilities/lapsStats",
    "framework/tooltips",
    "hbs!templates/views/expando/lapSplitTemplate"
],
function(
    _,
    TP, 
    LapsStats,
    ToolTips,
    lapSplitTemplate
    )
{
    return TP.ItemView.extend(
    {
        events:
        {
            "click td.lap": "handleLapClickEditable"
        },

        tagName: 'tr',
        template:
        {
            type: "handlebars",
            template: lapSplitTemplate
        },

        serializeData: function()
        {
            var data = [],
                empties = {};
            var obj = this.model.toJSON();

            LapsStats.formatLapObject(obj, this.workoutDefaults, data, empties, this.model.collection.availableDataChannels);

            var allLapData = {};
            _.each(data[0], function(value, key)
            {
                var dataArray = key.split(' ');
                var keyName = [dataArray[0].toLowerCase(), dataArray.slice(1).join('')].join('');

                allLapData[keyName] = value;
            });


            var subsetLapData = [];
            _.each(this.keyNames, function(keyName, index)
                {
                    subsetLapData.push( { key: keyName, value: allLapData[keyName] } );
                }, this);

            return { lapData: subsetLapData };
        },

        handleLapClickEditable: function(e)
        {
            var $currentTarget = $(e.currentTarget);
            if($currentTarget.hasClass('editing')) return false;
            e.preventDefault();

            ToolTips.disableTooltips();
            var $input = $('<input type=text/>');
            $input.val($currentTarget.text());
            $currentTarget.empty().append($input).addClass('editing');
            $input.on("change", _.bind(this._onInputChange, this));
            $input.on("blur", _.bind(this._onInputBlur, this));
            $input.focus();
        },

        _onInputChange: function(e)
        {
            var $input = $(e.currentTarget);
            this.model.set("name", $input.val());
        },

        _onInputBlur: function(e)
        {
            var $input = $(e.currentTarget);
            this.model.set("name", $input.val());
            $input.closest("td").html(this.model.get("name")).removeClass("editing");
            $input.off("change");
            $input.off("blur");
            ToolTips.enableTooltips();
        }

    });
});
