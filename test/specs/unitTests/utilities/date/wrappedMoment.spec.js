define(
[
    "underscore",
    "moment"
],
function(
    _,
    moment
    )
{
    describe("wrappedMoment", function()
    {
        describe("default constructor", function()
        {
            it("Should be a function", function()
            {
                expect(_.isFunction(moment)).to.be.ok;
            });

            it("Should return a utc date", function()
            {
                expect(moment()._isUTC).to.be.ok;
            });

            it("Should not accept a local moment as input", function()
            {
                var constructFromLocalMoment = function()
                {
                    var localMoment = moment.local();
                    var newMoment = moment(localMoment);
                };

                expect(constructFromLocalMoment).to.throw();
            });

            it("Should return a new moment instance without modifying the source instance", function()
            {
                var originalMoment = moment();
                var utcMoment = moment(originalMoment);
                expect(originalMoment._isUTC).to.be.ok;
                expect(utcMoment._isUTC).to.be.ok;
                expect(utcMoment === originalMoment).to.not.be.ok;
            });
        });

        describe(".utc", function()
        {

            it("Should have a .utc method", function()
            {
                expect(_.isFunction(moment.utc)).to.be.ok;
            });

            it("Should return a utc date", function()
            {
                expect(moment.utc()._isUTC).to.be.ok;
            });

            it("Should convert a local date to utc", function()
            {
                var localMoment = moment.local();
                var newMoment = moment.utc(localMoment);
                expect(newMoment._isUTC).to.be.ok;
            });

            it("Should preserve a utc date", function()
            {
                var utcMoment = moment.utc();
                var newMoment = moment(utcMoment);
                expect(newMoment._isUTC).to.be.ok;
            });

            it("Should return a new moment instance without modifying the source instance", function()
            {
                var localMoment = moment.local();
                var utcMoment = moment.utc(localMoment);
                expect(utcMoment === localMoment).to.not.be.ok;
                expect(localMoment._isUTC).to.not.be.ok;
                expect(utcMoment._isUTC).to.be.ok;
            });
        });

        describe(".local", function()
        {

            it("Should have a .local method", function()
            {
                expect(_.isFunction(moment.local)).to.be.ok;
            });

            it("Should return a local date", function()
            {
                expect(moment.local()._isUTC).to.not.be.ok;
            });

            it("Should convert a utc date to local", function()
            {
                var utcMoment = moment.utc();
                var newMoment = moment.local(utcMoment);
                expect(newMoment._isUTC).to.not.be.ok;
            });

            it("Should preserve a local date", function()
            {
                var localMoment = moment.local();
                var newMoment = moment.local(localMoment);
                expect(newMoment._isUTC).to.not.be.ok;
            });

            it("Should return a new moment instance without modifying the source instance", function()
            {
                var utcMoment = moment.utc();
                var localMoment = moment.local(utcMoment);
                expect(localMoment === utcMoment).to.not.be.ok;
                expect(utcMoment._isUTC).to.be.ok;
                expect(localMoment._isUTC).to.not.be.ok;
            });
        });

    });
});
