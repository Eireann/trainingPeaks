define(
[
    "TP"
],
function(TP)
{
    return TP.Collection.extend(
    {
        deleteWeekItems: function()
        {
            this.each(function(item)
            {
                if (item.deleteDayItems)
                    item.deleteDayItems();
            });
        }
    });
});