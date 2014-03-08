define(
[
    "underscore",
    "jquery",
    "TP",
    "hbs!publicFileViewer/userProfileImageViewTemplate"
],
function(
    _,
    $,
    TP,
    userProfileImageViewTemplate
)
{

    var UserProfileImageView = TP.ItemView.extend({
        className: "profileImage",
        tagName: "div",

        template:
        {
            type: "handlebars",
            template: userProfileImageViewTemplate
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

    return UserProfileImageView;
});