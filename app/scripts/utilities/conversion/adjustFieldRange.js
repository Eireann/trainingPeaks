define(
[
],
function ()
{
    var maxDuration = 99 + (59 / 60); //Duration is in decimal hours, limit is 99:59:00 currently
    var maxPace = 99 + (59 / 60) + (59 / 3600); //99:59:59  

    var adjustFieldRange = function(value, fieldName)
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
                    
            }
            return newValue;
        }
    };

    return adjustFieldRange;
});