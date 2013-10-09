define(
[
    "underscore"
],
function(_)
{

    // HTML charcter codes 
    var allowedCharCodes = [];

    // hyphen
    allowedCharCodes.push(45);

     // period 
    allowedCharCodes.push(46);

    // colon 
    allowedCharCodes.push(58);

    // numbers 0-9
    for(var n = 48; n<=57; n++)
    {
        allowedCharCodes.push(n);
    }

    // ascii control characters
    for(var c = 0;c<=31;c++)
    {
        allowedCharCodes.push(c);
    }

    
    var textFieldNumberFilter =
    {

        isNumberKey: function (charCode)
        {

            if(_.contains(allowedCharCodes, charCode))
            {
                return true;
            }

            return false;
        }

    };

    return textFieldNumberFilter;
});