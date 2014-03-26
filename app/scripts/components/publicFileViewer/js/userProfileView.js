define(
[
    "underscore",
    "jquery",
    "TP",
    "hbs!../templates/userProfileViewTemplate"
],
function(
    _,
    $,
    TP,
    userProfileViewTemplate
)
{

    var UserProfileView = TP.ItemView.extend({
        className: "userProfile",
        tagName: "div",

        template:
        {
            type: "handlebars",
            template: userProfileViewTemplate
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

    return UserProfileView;
});