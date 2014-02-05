define(
[
    "underscore",
    "setImmediate",
    "TP",
    "moment",
    "jqueryFullScreen"
],
function(
         _,
         setImmediate,
         TP,
         moment,
         jqueryFullScreen
         )
{

    function FullScreenManager(options)
    {
        this.initialize(options);
    }

    _.extend(FullScreenManager.prototype, TP.Events);
    _.extend(FullScreenManager.prototype, {

        initialize: function(options)
        {
            this._isFullScreen = false;

            this.analytics = options.analytics || TP.analytics;

            if(!options || !options.screen || !options.$body || !options.$document || !options.$window)
            {
                throw new Error("FullScreenManager requires screen, window, document, and body options");
            }

            this.screen = options.screen;
            this.$document = options.$document;
            this.$window = options.$window;
            this.$body = options.$body;

            var onFullScreenChange = _.bind(_.debounce(this._onFullScreenChange, 100), this);
            this.$document.on("fullscreenchange.fullScreenManager", onFullScreenChange);
            this.$window.on("resize.fullScreenManager", onFullScreenChange);

            this._updateFullScreenState();
        },

        close: function()
        {
            this.$document.off("fullscreenchange.fullScreenManager");
            this.$window.off("resize.fullScreenManager");
        },

        isFullScreen: function()
        {
            return this._isFullScreen;
        },

        toggleFullScreen: function(fullScreen)
        {
            if(_.isUndefined(fullScreen))
            {
                fullScreen = !this._isFullScreen;
            }
            this.$document.toggleFullScreen(fullScreen);
        },

        _onFullScreenChange: function()
        {
            setImmediate(_.bind(this._updateFullScreenState, this));
        },

        _checkIfFullScreen: function()
        {
            return !!this.$document.fullScreen() || (this.$window.innerHeight() === this.screen.height);
        },

        _updateFullScreenState: function()
        {
            var isFullScreen = this._checkIfFullScreen();
            var changed = isFullScreen !== this._isFullScreen;
            this._isFullScreen = isFullScreen;

            this.$body.toggleClass("fullScreen", this._isFullScreen);

            if(changed)
            {
                this._logFullScreen(this._isFullScreen);
                this.trigger("change:fullScreen", this, this._isFullScreen);
            }
        },

        _logFullScreen: function(isFullScreen)
        {
            if(isFullScreen)
            {
                this.fullScreenStartTime = moment().unix();
                console.log("Entered full screen", this.fullScreenStartTime);
                this.analytics("send", { "hitType": "event", "eventCategory": "calendar", "eventAction": "enterFullScreen", "eventLabel": "" });
            }
            else if(this.fullScreenStartTime)
            {
                console.log("Exited full screen ", moment().unix());
                var secondsInFullScreen = moment().unix() - this.fullScreenStartTime;
                delete this.fullScreenStartTime;
                console.log("Closing full screen after " + secondsInFullScreen + " seconds");
                this.analytics("send", { "hitType": "event", "eventCategory": "calendar", "eventAction": "exitFullScreen", "eventLabel": "", "metric1": secondsInFullScreen });
            }
        }

    });

    return FullScreenManager;

});
