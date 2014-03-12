define(
[
    "underscore",
    "jquery",
    "TP",
    "hbs!../templates/dateAndTimeViewTemplate"
],
function(
    _,
    $,
    TP,
    dateAndTimeViewTemplate
)
{

    var DateAndTimeView = TP.ItemView.extend({
        className: "dateAndTime",
        tagName: "div",

        template:
        {
            type: "handlebars",
            template: dateAndTimeViewTemplate 
        }
    });

    return DateAndTimeView;
});