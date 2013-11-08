define(
[
    "TP",
    "shared/data/userUpgradeViewSlides",
    "hbs!templates/views/userUpgradeView"
],
function (TP, slides, userUpgradeTemplate)
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
            return { slides: slides, upgradeUrl: apiConfig.cmsRoot + "/account" };
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
            this.$(".upgradeSlideText").text(slide.text);
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
