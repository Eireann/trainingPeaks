define(
[
    "handlebars"
],
function(Handlebars)
{

    var PUBLIC = 1;
    var PRIVATE = 2;

    var ifWorkoutIsPublic = function(publicSettingValue, options)
    {
        var isPublic = Number(publicSettingValue) === PUBLIC;

        if(isPublic)
        {
            return options.fn(this);
        } else
        {
            return options.inverse(this);
        }
    };

    Handlebars.registerHelper("ifWorkoutIsPublic", ifWorkoutIsPublic);
    return ifWorkoutIsPublic;
});