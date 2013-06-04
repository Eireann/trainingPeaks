define(
[
],
function ()
{
    var maxDuration = 99 + (59 / 60); //Duration is in decimal hours, limit is 99:59:00 currently
    var maxPace = 99 + (59 / 60) + (59 / 3600); //99:59:59
    var maxSpeed = 999;
    var maxDistance = 999999;
    var maxTSS = 9999;
    var maxCalories = 99999;
    var maxElevation = 99999;
    var maxPower = 9999;
    var maxTorque = 9999;
    var maxCadence = 255;
    var maxHR = 255;
    var maxTemp = 999;
    
    var adjustFieldRange = function (value, fieldName)
    {

        if (isNaN(value) || !fieldName)
        {
            return value;
        }
        else
        {
            var newValue = value;
            switch (fieldName)
            {
                case "duration":
                    if (value < 0)
                    {
                        newValue = 0;
                    }
                    else if (value > maxDuration)
                    {
                        newValue = maxDuration;
                    }
                    break;
                case "pace":
                    if (value < 0)
                    {
                        newValue = 0;
                    }
                    else if (value > maxPace)
                    {
                        newValue = maxPace;
                    }
                    break;
                case "distance":
                    if (value < 0)
                    {
                        newValue = 0;
                    }
                    else if (value > maxDistance)
                    {
                        newValue = maxDistance;
                    }
                    break;
                case "tss":
                    if (value < 0)
                    {
                        newValue = 0;
                    }
                    else if (value > maxDistance)
                    {
                        newValue = maxDistance;
                    }
                    break;
            }
            return newValue;
        }
    };

    return adjustFieldRange;
});