define(
[
    "underscore",
    "TP",
    "shared/data/userUpgradeViewSlides",
    "hbs!templates/views/userUpgradeView"
],
function (_, TP, slides, userUpgradeTemplate)
{
    return TP.ItemView.extend(
    {
        modal:
        {
            mask: true,
            shadow: true
        },

        closeOnResize: false,

        showThrobbers: false,
        tagName: "div",
        className: "userUpgradeView dialog",

        events:
        {
            "click .closeIcon": "close",
            "click .upgradeSlidePrev": "_prevSlide",
            "click .upgradeSlideNext": "_nextSlide"
        },

        template:
        {
            type: "handlebars",
            template: userUpgradeTemplate
        },

        serializeData: function()
        {
            var userType = theMarsApp.user.getAccountSettings().get("userType");
            var upgradeURL = userType === 5 ? theMarsApp.apiConfig.coachUpgradeURL : theMarsApp.apiConfig.upgradeURL;
            return { slides: slides, upgradeUrl: upgradeURL.replace("http:","https:") };
        },

        onRender: function()
        {
            this.showSlide(this.options.slideId);
        },

        showSlide: function(slideId)
        {
            this.index = Math.max(_.findIndex(slides, { id: slideId }), 0);
            this.updateSlide();
        },

        updateSlide: function()
        {
            var slide = slides[this.index];
            this.$(".upgradeSlidePosition").text("" + (this.index + 1) + "/" + slides.length);

            this.$(".upgradeSlideTitle").text(slide.title);
            this.$(".upgradeSlideText").html(slide.html);
            this.$(".upgradeSlideImage").attr("src", slide.image);
        },

        _nextSlide: function()
        {
            this.index = (this.index + 1) % slides.length;
            this.updateSlide();
        },

        _prevSlide: function()
        {
            this.index--;
            if(this.index < 0)
            {
                this.index += slides.length;
            }
            this.updateSlide();
        }

    });
});
