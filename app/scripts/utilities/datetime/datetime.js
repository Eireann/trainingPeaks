define(
[
    "utilities/datetime/format",
    "utilities/datetime/convert"
], function(constants, format, convert)
{
    return {

        shortDateFormat: "YYYY-MM-DD",
        timeFormat: "Thh:mm:ss",
        longDateFormat: "YYYY-MM-DDThh:mm:ss",

        constants: constants,
        format: format,
        convert: convert
    };
});