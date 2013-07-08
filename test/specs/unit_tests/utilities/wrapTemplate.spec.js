requirejs(
[
    "handlebars",
    "utilities/wrapTemplate"
],
function(Handlebars, wrapTemplate)
{
    describe("wrapTemplate helper", function()
    {

        var myContext = {
            title: "My Title",
            description: "My Description"
        };

        var myInnerTemplate = Handlebars.compile("<div>{{ title }}</div><div>{{ description }}");
        var myOuterTemplate = Handlebars.compile("<div id='outerTemplate'>{{{ innerHtml }}}</div>");

        it("Should be loaded as a module", function()
        {
            expect(typeof wrapTemplate).toBe("function");
        });

        it("Should contain the inner template results", function()
        {
            var wrappedHtml = wrapTemplate(myContext, myInnerTemplate, myOuterTemplate, "innerHtml");
            expect(wrappedHtml).toContain(myContext.title);
            expect(wrappedHtml).toContain(myContext.description);
            expect(wrappedHtml).toContain(myInnerTemplate(myContext));
        });

        it("Should contain the outer template results", function()
        {
            var wrappedHtml = wrapTemplate(myContext, myInnerTemplate, myOuterTemplate, "innerHtml");
            expect(wrappedHtml).toContain("<div id='outerTemplate'>");
        });
    });
});