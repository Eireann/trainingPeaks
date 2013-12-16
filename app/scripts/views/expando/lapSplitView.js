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
            var row = this.model.toJSON();

            var subsetLapData = [];
            _.each(this.lapsStats.columns, function(column, index)
            {
                subsetLapData.push(
                {
                    key: column.id,
                    value: this.lapsStats.processCell(column, row, {format: { seconds: true }})
                });
            }, this);

            return { lapData: subsetLapData, _state: this.model.getState().toJSON() };

        }

    });
});
