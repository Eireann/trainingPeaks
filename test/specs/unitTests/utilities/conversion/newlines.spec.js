define(
[
    "utilities/conversion/conversion"
],
function(conversion)
{

    describe("Line Return Parsing and Formatting", function()
    {
        describe("Format new lines", function()
        {
            it("Should replace line feed (\\n) or carriage return (\\r) with carriage return and line feed (\\r\\n)", function()
            {
                expect(conversion.formatUnitsValue("text", "A\nstring\rwith\rnew\nlines")).to.eql("A\r\nstring\r\nwith\r\nnew\r\nlines");
            });

            it("Should preserve multiple new lines", function()
            {
                expect(conversion.formatUnitsValue("text", "A\nstring\nwith\r\r\r\rnew\nlines")).to.eql("A\r\nstring\r\nwith\r\n\r\n\r\n\r\nnew\r\nlines");
            });
        });

        describe("Parse new lines", function()
        {
            it("Should replace carriage return and line feed (\\r\\n) with carriage return (\\r)", function()
            {
                expect(conversion.parseUnitsValue("text", "A\r\nstring\r\nwith\r\nnew\r\nlines")).to.eql("A\rstring\rwith\rnew\rlines");
            });

            it("Should preserve multiple new lines", function()
            {
                expect(conversion.parseUnitsValue("text", "A\r\nstring\nwith\n\r\n\r\n\nnew\nlines")).to.eql("A\rstring\rwith\r\r\r\rnew\rlines");
            });
        });
    });

});
