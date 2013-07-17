define(
[
],
function()
{
    return {
        printWorkout: function(personId, workoutId)
        {
            var url = "https://www.trainingpeaks.com/ui/Print/default.aspx?personId=" + personId + "&workoutId=" + workoutId;
            window.open(url);
        },
        
        printDay: function(personId, momentDay)
        {
            var formattedDate = momentDay.format("MM/DD/YYYY");
            var url = "https://www.trainingpeaks.com/ui/Print/default.aspx?view=day&personId=" + personId + "&date=" + formattedDate;
            window.open(url);
        },
        
        printWeek: function()
        {
            throw "not implemented";
        }
    };
});