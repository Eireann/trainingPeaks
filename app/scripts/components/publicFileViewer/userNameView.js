define(
[
    "underscore",
    "jquery",
    "TP",
    "hbs!publicFileViewer/userNameViewTemplate"
],
function(
    _,
    $,
    TP,
    userNameViewTemplate
)
{

    var UserNameView = TP.ItemView.extend({
        className: "profileImage cf",
        tagName: "div",

        template:
        {
            type: "handlebars",
            template: userNameViewTemplate
        },

        serializeData: function()
        {
            var data = this.model.toJSON();

            if (data.profileImageUrl)
            {
                data.profileImageUrl = this.options.wwwRoot + data.profileImageUrl;
            }

            return data;
        }
    });

    return UserNameView;
});