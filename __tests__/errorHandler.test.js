const errorHandler = require("../src/middleware/errorHandler");

let res;
let next;

beforeEach(() => {
    res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        headersSent: false
    };

    next = jest.fn();

    jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
    jest.restoreAllMocks();
});

test("Handles unexpected server errors", () => {
    errorHandler(new Error("Database failure"), {}, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
        error: "Internal server error."
    });
    expect(console.error).toHaveBeenCalled();
});

test("Handles invalid requests", () => {
    errorHandler({ status: 413 }, {}, res, next);

    expect(res.status).toHaveBeenCalledWith(413);
    expect(res.json).toHaveBeenCalledWith({
        error: "Invalid request."
    });
});

test("Passes errors forward when headers were sent", () => {
    res.headersSent = true;
    const error = new Error("Server error");

    errorHandler(error, {}, res, next);

    expect(next).toHaveBeenCalledWith(error);
    expect(res.json).not.toHaveBeenCalled();
});