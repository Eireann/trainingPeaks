define(
[
    "TP",
    "shared/data/metricTypes",
    "quickview/metric/views/metricQVItemView"
],
function(
    TP,
    metricTypes,
    MetricQVItemView
)
{
    describe("MetricQVItemView", function ()
    {
        var type, model, view;
        function createView(value)
        {
            model = new TP.DeepModel({
                type: type,
                value: value
            });
            view = new MetricQVItemView({ model: model });
            view.render();
        }

        // Basic Numeric Metrics
        _.each(metricTypes, function(metricInfo)
        {

            // Skip note metrics
            if(metricInfo.id === 12) return;

            // Skip split metrics
            if(metricInfo.hasOwnProperty("subMetrics")) return;

            // Skip enumeration type metrics
            if(metricInfo.hasOwnProperty("enumeration")) return;

            describe("for metric type: " + metricInfo.id + " (" + metricInfo.label + ")", function()
            {

                beforeEach(function() {
                    type = metricInfo.id;
                });

                if(!metricInfo.hasOwnProperty("min") || metricInfo.min <= 0)
                {
                    it("should display 0s", function()
                    {
                        createView(0);
                        expect(view.$("input[name=value]").val()).to.match(/^0[\.0]*$/);
                    });

                    it("should parse 0s as 0", function()
                    {
                        createView(42);
                        view.$("input[name=value]").val("0").change();
                        expect(model.get("value")).to.eql(0);
                        expect(view.$("input[name=value]").val()).to.match(/^0[\.0]*$/);
                    });
                }
                else
                {
                    it("should parse 0s as the minimum value", function()
                    {
                        createView(42);
                        view.$("input[name=value]").val("0").change();
                        expect(model.get("value")).to.eql(metricInfo.min);
                    });
                }

                it("should display null's as a blank string", function()
                {
                    createView(null);
                    expect(view.$("input[name=value]").val()).to.eql("");
                });

                it("should parse blank strings as null", function()
                {
                    createView(42);
                    view.$("input[name=value]").val("").change();
                    expect(model.get("value")).to.eql(null);
                    expect(view.$("input[name=value]").val()).to.eql("");
                });


            });

        });

        // Enumeration Type Metrics
        _.each(metricTypes, function(metricInfo)
        {

            if(!metricInfo.hasOwnProperty("enumeration")) return;

            describe("for metric type: " + metricInfo.id + " (" + metricInfo.label + ")", function()
            {

                beforeEach(function() {
                    type = metricInfo.id;
                });

                it("should display a select box with an empty value", function()
                {
                    createView(null);
                    expect(view.$("select[name=value]").val()).to.eql("");
                });

                it("should display a select box with an empty value even when the metric has a value", function()
                {
                    createView(metricInfo.enumeration[0].value);
                    expect(view.$("select[name=value] option[value=]").length).to.eql(1);
                });

            });

        });

    });
});

