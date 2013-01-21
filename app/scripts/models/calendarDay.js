define(
[
    "backbone"
],
function(Backbone)
{
    return Backbone.Model.extend(
    {
        setWorkout: function(workout)
        {
            this.set("workout", workout);
        }
    });
});