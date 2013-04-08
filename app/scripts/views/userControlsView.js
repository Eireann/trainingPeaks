define(
[
    "underscore",
    "TP",
    "views/accountMenuView",
    "hbs!templates/views/userControls"
],
function (_, TP, AccountMenuView, userControlsTemplate)
{
    return TP.ItemView.extend(
    {
        template:
        {
            type: "handlebars",
            template: userControlsTemplate
        },

        ui:
        {
            "settingsButton": "#userName"
        },
        
        events:
        {
            "click #userName": "onUsernameLabelClicked"
        },

        modelEvents:
        {
            "change": "render"
        },
        
        onUsernameLabelClicked: function(e)
        {
            //document.getSelection().removeAllRanges();
            
            var offset = $(e.currentTarget).offset();
            this.accountMenu = new AccountMenuView({model: this.model, parentEl: this.$el });
            this.accountMenu.render().top(offset.top + 18).left(offset.left);
        }
    });
});