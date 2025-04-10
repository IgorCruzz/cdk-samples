export const handler = async (event: any) => {
    console.log('Event:', event);

    try {
        return {
            statusCode: 200,
            body: JSON.stringify({
                foo: 'bar',
            }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'Internal Server Error',
            }),
        };
    }
};
