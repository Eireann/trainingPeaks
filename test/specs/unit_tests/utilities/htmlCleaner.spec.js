define(
[
    "underscore",
    "jquery",
    "utilities/htmlCleaner"
],
function (
    _,
    $,
    htmlCleaner
    )
{
    describe("HTMLCleaner", function ()
    {
        describe(".clean", function()
        {
            it("Should be a function", function()
            {
                expect(_.isFunction(htmlCleaner.clean)).to.be.ok;
            });

            it("Should remove unwanted html tags", function()
            {
                var html = "<div><i><font style='color:red'>i am ugly red text</font></i></div>";
                var cleaned = htmlCleaner.clean(html);
                expect($(html).find("font").length).to.eql(1);
                expect($(cleaned).find("font").length).to.eql(0);
            });

            it("Should remove unwanted html / css attributes", function()
            {
                var html = "<div><p style='color:red'>i am also ugly red text</p></div>";
                var cleaned = htmlCleaner.clean(html);
                expect($("<div>").html(html).find("p").css("color")).to.eql("red");
                expect($("<div>").html(cleaned).find("p").css("color")).to.not.eql("red");
            });

            it("Should remove unwanted css class names", function()
            {
                var html = "<div><p class='red'>i am also ugly red text</p></div>";
                var cleaned = htmlCleaner.clean(html);
                expect($("<div>").html(html).find("p").is(".red")).to.be.ok;
                expect($("<div>").html(cleaned).find("p").is(".red")).to.not.be.ok;
            });

            it("Should wrap plain text in paragraph tags", function()
            {
                var html = "I am paragraph one";
                var cleaned = htmlCleaner.clean(html);
                expect($("<div>").html(html).find("p").length).to.eql(0);
                expect($("<div>").html(cleaned).find("p").length).to.eql(1)
            });
        });

    });
});
