define(
["underscore"],
function(_)
{
    return function(list, offset)
    {
        if (list.length === 0)
            return -1;

        var low = 0;
        var high = list.length - 1;
        var midpoint = 0;

        if (list[low] >= offset)
            return low;
        else if (list[high] <= offset)
            return high;

        while (low <= high)
        {
            midpoint = low + Math.ceil((high - low) / 2.0);

            // We need do this check here for smart-recorded files
            if (list[low] >= offset)
                return low;
            else if (list[high] <= offset)
                return high;

            if (offset >= list[midpoint] && offset <= list[midpoint + 1])
            {
                // For a smart-recorded file it could be midpoint, or midpoint+1
                if (offset === list[midpoint + 1])
                    return midpoint + 1;
                else
                    return midpoint;
            }
            else if (offset < list[midpoint])
                high = midpoint - 1;
            else
                low = midpoint + 1;
        }

        return -1;
    };
});
