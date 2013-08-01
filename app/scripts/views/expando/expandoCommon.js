define(
[
    "TP"
], function(TP)
{
    return {
        calculateTotalAndMovingTime: function(lapData)
        {
            lapData.movingTime = TP.utils.datetime.convert.millisecondsToDecimalHours(lapData.elapsedTime - lapData.stoppedTime);
            lapData.totalTime = TP.utils.datetime.convert.millisecondsToDecimalHours(lapData.elapsedTime);

            if (lapData.stoppedTime > 0)
            {
                lapData.hasStoppedTime = true;
            }
        }
    };
});