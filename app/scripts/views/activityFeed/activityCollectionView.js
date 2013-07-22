define(
[
    "TP",
    "models/workoutModel",
    "views/workout/workoutBarView",
    "views/dayBarView"
],
function (TP, WorkoutModel, WorkoutBarView, DayBarView)
{
    return TP.CollectionView.extend(
    {
        tagName: "div",
        className: "activityCollection",
        showThrobbers: false,

        getItemView: function(item)
        {
            if (item instanceof WorkoutModel)
                return WorkoutBarView;
            else if (item.isDay)
                return DayBarView;
            else
                throw "not implemented";
        }
        /*,

        appendHtml: function(collectionView, itemView, index)
        {
            var previousItem = index > 0 ? collectionView.$("#" + collectionView.collection.models[index - 1].id) : null;
            var nextItem = collectionView.collection.models.length > (index + 1) ? collectionView.$("#" + collectionView.collection.models[index + 1].id) : null;

            // next item in collection has been rendered, prepend it before next item
            if (nextItem && nextItem.length)
            {
                nextItem.parent().before(itemView.el);

                // previous item in collection has been rendered, append it after previous item
            } else if (previousItem && previousItem.length)
            {
                previousItem.parent().after(itemView.el);
            // default: append it at end
            } else
            {
                collectionView.$el.append(itemView.el);
            }
        }
        */

    });
});