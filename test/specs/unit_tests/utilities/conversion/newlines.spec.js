requirejs(
[
    "utilities/conversion/conversion"
],
function(conversion)
{

    describe("Line Return Parsing and Formatting", function()
    {
        it("Should replace line feed (\\n) with carriage return and line feed (\\r\\n)", function()
        {
            expect(conversion.fixNewlines("A\nstring\nwith\nnew\nlines")).toEqual("A\r\nstring\r\nwith\r\nnew\r\nlines");
        });

        it("Should preserve multiple new lines", function()
        {
            expect(conversion.fixNewlines("A\nstring\nwith\n\n\n\nnew\nlines")).toEqual("A\r\nstring\r\nwith\r\n\r\n\r\n\r\nnew\r\nlines");
        });
    });

});