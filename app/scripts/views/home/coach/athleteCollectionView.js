define(
[
    "TP",
    "./athleteItemView"
],
function(TP, AthleteItemView)
{
    return TP.CollectionView.extend(
    {
        tagName: "div",
        className: "athleteCollection",
        itemView: AthleteItemView
    });
});