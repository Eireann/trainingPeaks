requirejs(
[
    "utilities/metrics"
],
function(metricsUtils)
{
    describe("metrics utilities", function()
    {

        describe("infoFor", function()
        {

            it("should return metric info based on the type", function()
            {
                var info = metricsUtils.infoFor({ type: 1 });
                expect(info.id).toEqual(1);
                expect(info.label).toEqual("Blood Pressure");
            });

            it("should return info with merged sub-info based on the index", function()
            {
                var info = metricsUtils.infoFor({ type: 1, index: 0 });
                expect(info.id).toEqual(1);
                expect(info.label).toEqual("Systolic");
            });

            it("should not mutate the original info!!!", function()
            {
                metricsUtils.infoFor({ type: 1, index: 0 });
                var info = metricsUtils.infoFor({ type: 1 });
                expect(info.id).toEqual(1);
                expect(info.label).toEqual("Blood Pressure");
            });

        });

        describe("labelFor", function()
        {
            if("should return the label based on type", function()
            {
                var label = metricsUtils.labelFor({ type: 1 });
                expect(label).toEqual("Blood Pressure");
            });

            if("should return the label based on type and index", function()
            {
                var label = metricsUtils.labelFor({ type: 1, index: 1 });
                expect(label).toEqual("Diastolic");
            });
        });

    });

});