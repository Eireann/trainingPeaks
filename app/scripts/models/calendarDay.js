define(
[
    "TP"
],
function(TP)
{
    return TP.Model.extend(
    {
        setWorkout: function(workout)
        {
            this.set("workout", workout);
        },

        getWorkout: function(workout)
        {
            return this.get("workout");
        }
    });
});