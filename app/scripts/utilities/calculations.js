define(
[
], function ()
{
    return {

        calculatePercentComplete: function(completedValue, plannedValue)
        {
            if (plannedValue)
            {
                return Math.round(100 * (completedValue / plannedValue));
            } else if(completedValue)
            {
                return 100;
            } else
            {
                return 0;
            }
        }
    };
});