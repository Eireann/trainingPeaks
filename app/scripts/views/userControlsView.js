define(
[
    "underscore",
    "TP",
    "utilities/image",
    "views/accountMenuView",
    "hbs!templates/views/userControls"
],
function (_, TP, imageUtils, AccountMenuView, userControlsTemplate)
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
 
        initialize: function()
        {
            this.on("render", this.updateHeaderColorFromLogoOnLoad, this);
        },

        onUsernameLabelClicked: function(e)
        {
            //document.getSelection().removeAllRanges();
            
            var offset = $(e.currentTarget).offset();
            this.accountMenu = new AccountMenuView({model: this.model, parentEl: this.$el });
            this.accountMenu.render().top(offset.top + 18).left(offset.left);
        },

        updateHeaderColorFromLogoOnLoad: function()
        {
            // only for coaches / affiliates - how?
            _.bindAll(this, "updateHeaderColorFromLogo");
            this.$("#topLogo").on("load", this.updateHeaderColorFromLogo);
        },

        updateHeaderColorFromLogo: function()
        {
        
            var logoImg = this.$("#topLogo")[0];
            var colorData = imageUtils.getImageColorAtRightEdge(logoImg);
            // we can't just join colorData because it's a Uint8ClampedArray
            //var rgbaColor = "rgba(" + colorData[0] + "," + colorData[1] + "," + colorData[2] + "," + colorData[3] + ")";
            var rgbColor = "rgba(" + colorData[0] + "," + colorData[1] + "," + colorData[2] + ")";
            this.$("#userControlsBackground").css("background-color", rgbColor);
        }

    });
});