define(
[
    "underscore",

    "TP",
    "utilities/lapsStats",

    "hbs!templates/views/expando/lapSplitTemplate"
],
function(
    _,
    TP, LapsStats,
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

            LapsStats.formatLapObject(obj, this.workoutDefaults, data, empties);

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
            $currentTarget.html('<input type=text/>').addClass('editing').find('input').focus();
            this.model.trigger('expando:lapEdit');
        }
    });
});
