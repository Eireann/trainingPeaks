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
            "click .upgradeSlideNext": "_nextSlide",
            "click a.upgradeButton": "_onUpgradeClicked"
        },

        template:
        {
            type: "handlebars",
            template: userUpgradeTemplate
        },

        initialize: function(options)
        {
            this.userType = _.has(options, "userType") ? options.userType : theMarsApp.user.getAccountSettings().get("userType");
            this.imageRoot = _.has(options, "imageRoot") ? options.imageRoot : "";
        },

        serializeData: function()
        {
            var upgradeURL = this.userType === 5 ? theMarsApp.apiConfig.coachUpgradeURL : theMarsApp.apiConfig.upgradeURL;
            return { slides: slides, upgradeUrl: upgradeURL.replace("http:","https:") };
        },

        onRender: function()
        {
            this._trackGAEvent("upgradeViewOpened", this.options.slideId);
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
            this.$(".upgradeSlideImage").attr("src", this.imageRoot + slide.image);
        },

        _nextSlide: function()
        {
            this.index = (this.index + 1) % slides.length;
            this.updateSlide();

            this._trackGAEvent("nextSlide");
        },

        _prevSlide: function()
        {
            this.index--;
            if(this.index < 0)
            {
                this.index += slides.length;
            }
            this.updateSlide();
            this._trackGAEvent("previousSlide");
        },

        _onUpgradeClicked: function()
        {
            this._trackGAEvent("upgradeButtonClicked");
        },

        _getSlideNameByIndex: function(index)
        {
            return slides[index] ? slides[index].id : "n/a";    
        },

        _trackGAEvent: function(action, label)
        {
            TP.analytics("send", { "hitType": "event", "eventCategory": "upgradePrompt", "eventAction": action, "eventLabel": label ? label : this._getSlideNameByIndex(this.index) });
        }
    });
});
