const { handler } = require('../../server');

// Export the handler for Netlify Functions
exports.handler = async (event, context) => {
  try {
    // Log the incoming request
    console.log('Event:', JSON.stringify(event, null, 2));
    
    // Ensure the path is correctly formatted
    if (event.path) {
      // Remove the function path from the event path
      event.path = event.path.replace('/.netlify/functions/api', '') || '/';
    }
    
    // Call the actual handler
    const response = await handler(event, context);
    
    // Log the response
    console.log('Response:', JSON.stringify(response, null, 2));
    
    return response;
  } catch (error) {
    // Log any errors
    console.error('Error in API handler:', error);
    
    // Return a 500 error response
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal Server Error',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      }
    };
  }
};
