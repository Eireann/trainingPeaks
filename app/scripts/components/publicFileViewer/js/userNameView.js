define(
[
    "underscore",
    "jquery",
    "TP",
    "hbs!../templates/userNameViewTemplate"
],
function(
    _,
    $,
    TP,
    userNameViewTemplate
)
{

    var UserNameView = TP.ItemView.extend({
        className: "userName",
        tagName: "div",

        template:
        {
            type: "handlebars",
            template: userNameViewTemplate
        }
    });

    return UserNameView;
});