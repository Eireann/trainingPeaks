define(
[
    "underscore",
    "utilities/lapsStats",
    "views/expando/editableLapView",
    "hbs!templates/views/expando/lapSplitTemplate"
],
function(
    _,
    LapsStats,
    EditableLapView,
    lapSplitTemplate
    )
{
    return EditableLapView.extend(
    {

        tagName: 'tr',

        template:
        {
            type: "handlebars",
            template: lapSplitTemplate
        },

        modelEvents: _.defaults({
            "change": "render"
        }, EditableLapView.prototype.modelEvents),

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

            return { lapData: subsetLapData, _state: this.model.getState().toJSON() };
        }

    });
});
