define(
[
    "TP"
], function (TP)
{
    return {
        calculateTotalAndMovingTime: function(lapData)
        {
            lapData.totalTime = TP.utils.datetime.convert.millisecondsToDecimalHours(lapData.end - lapData.begin);

            if (lapData.stoppedTime)
            {
                var stoppedTime = TP.utils.datetime.convert.millisecondsToDecimalHours(lapData.stoppedTime);
                lapData.movingTime = lapData.totalTime - stoppedTime;
            }
        }
    };
})