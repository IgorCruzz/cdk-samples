import {} from 

describe("extract-data", () => {
  beforeEach(() => {});

  it("should extract data from a valid JSON string", () => {
    const jsonString = '{"name": "John", "age": 30}';
    const result = JSON.parse(jsonString);
    expect(result).toEqual({ name: "John", age: 30 });
  });
});
