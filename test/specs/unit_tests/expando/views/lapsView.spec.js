define(
[
    "jquery",
    "TP",
    "views/expando/lapsView",
    "expando/models/expandoStateModel"
],
function(
    $,
    TP,
    LapsView,
    ExpandoStateModel
    )
{

    function buildWorkoutModel()
    {
        return new TP.Model({
            id: 1234,
            details: new TP.Model(),
            detailData: new TP.Model({
                totalStats: {},
                lapsStats: []
            })
        });
    }

    describe("LapsView", function()
    {
        it("Should have a valid contructor", function()
        {
            expect(LapsView).to.not.be.undefined;
            expect(function() { new LapsView({ model: buildWorkoutModel(), detailDataPromise: {}, stateModel: new ExpandoStateModel() }); }).to.not.throw();
        });
    });
});
