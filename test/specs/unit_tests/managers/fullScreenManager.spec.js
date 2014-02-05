define(
[
    "jquery",
    "underscore",
    "shared/managers/fullScreenManager"
],
function(
         $,
         _,
         FullScreenManager
         )
{

    describe("FullScreenManager", function()
    {
        var manager;
        beforeEach(function()
        {
            var doc = {
                isFullScreen: false,
                fullScreen: function(){ return this.isFullScreen;},
                toggleFullScreen: function(full){ 
                    this.isFullScreen = _.isUndefined(full) ? !this.isFullScreen : full; this.callback(); },
                callback: function(){},
                on: function(eventName, callback) { 
                    this.callback = callback; 
                },
                off: function(){ this.callback = function(){}; }
            };

            sinon.spy(doc, "fullScreen");
            sinon.spy(doc, "toggleFullScreen");

            var analytics = sinon.stub();

            manager = new FullScreenManager({
                analytics: analytics,
                screen: { height: 1000, width: 1500},
                $document: doc,
                $body: $("<body></body>"),
                $window: $("<div></div>")
            });
        });

        it("Should enable full screen mode", function(done)
        { 
            manager.toggleFullScreen();
            expect(manager.$document.toggleFullScreen).to.have.been.calledWith(true);

            setTimeout(function()
            {
                expect(manager.$body.is(".fullScreen")).to.be.ok;
                expect(manager.isFullScreen()).to.be.ok;
                done();
            }, 200);

        });

        it("Should disable full screen mode", function(done)
        { 
            manager.toggleFullScreen(false);
            expect(manager.$document.toggleFullScreen).to.have.been.calledWith(false);

            setTimeout(function()
            {
                expect(manager.$body.is(".fullScreen")).to.not.be.ok;
                expect(manager.isFullScreen()).to.not.be.ok;
                done();
            }, 200);
        });
    });

});
