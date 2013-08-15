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
    return TP.ItemView.extend(
    {
        initialize: function(options)
        {
            if (!options.model)
            {
                throw "Model is required for LapsSplitsView";
            }
        },
        serializeData: function()
        {
            //console.log(this.model.get('detailData').get('lapsStats'));
            return {
                laps: this.model.get('detailData').get('lapsStats')
            };
        }
    });
});