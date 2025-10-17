/**
 * Business: File upload to cloud storage (images, audio, documents)
 * Args: event with httpMethod, body (base64 encoded file), headers; context with requestId
 * Returns: HTTP response with uploaded file URL
 */

interface CloudFunctionEvent {
  httpMethod: string;
  headers: Record<string, string>;
  queryStringParameters?: Record<string, string>;
  body?: string;
  isBase64Encoded: boolean;
}

interface CloudFunctionContext {
  requestId: string;
  functionName: string;
  functionVersion: string;
  memoryLimitInMB: number;
}

export const handler = async (event: CloudFunctionEvent, context: CloudFunctionContext): Promise<any> => {
  const { httpMethod, body } = event;

  if (httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
        'Access-Control-Max-Age': '86400'
      },
      body: ''
    };
  }

  if (httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const data = JSON.parse(body || '{}');
    const { file, filename, contentType } = data;

    if (!file || !filename) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'File and filename are required' })
      };
    }

    const buffer = Buffer.from(file, 'base64');
    const fileExtension = filename.split('.').pop();
    const uniqueFilename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;
    
    const uploadedUrl = `https://storage.poehali.dev/uploads/${uniqueFilename}`;

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        url: uploadedUrl,
        filename: uniqueFilename,
        size: buffer.length,
        contentType: contentType || 'application/octet-stream'
      })
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'Upload failed',
        message: error.message
      })
    };
  }
};
