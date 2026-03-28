/**
 * API Documentation Generator & Schema Validation
 * Auto-generates OpenAPI/Swagger documentation from routes
 */

const { getLogger } = require('./logger');

const logger = getLogger('APIDoc');

class APIDocGenerator {
  constructor(options = {}) {
    this.routes = new Map();
    this.schemas = new Map();
    this.title = options.title || 'MessWala API';
    this.version = options.version || '2.0.0';
    this.baseUrl = options.baseUrl || 'https://api.messwala.com';
    this.contactEmail = options.contactEmail || 'support@messwala.com';
  }

  /**
   * Register an API endpoint with documentation
   */
  registerEndpoint(config) {
    const key = `${config.method} ${config.path}`;

    this.routes.set(key, {
      method: config.method,
      path: config.path,
      summary: config.summary || 'API Endpoint',
      description: config.description || '',
      tags: config.tags || ['general'],
      parameters: config.parameters || [],
      requestBody: config.requestBody || null,
      responses: config.responses || {
        200: { description: 'Success' },
        400: { description: 'Bad Request' },
        401: { description: 'Unauthorized' },
        500: { description: 'Server Error' },
      },
      security: config.security || [],
      examples: config.examples || [],
    });

    logger.debug(`API endpoint registered: ${key}`);
  }

  /**
   * Register a response schema
   */
  registerSchema(name, schema) {
    this.schemas.set(name, schema);
  }

  /**
   * Generate OpenAPI 3.0 specification
   */
  generateOpenAPI() {
    // Group endpoints by path
    const pathMap = new Map();
    for (const [, endpoint] of this.routes) {
      if (!pathMap.has(endpoint.path)) {
        pathMap.set(endpoint.path, {});
      }
      pathMap.get(endpoint.path)[endpoint.method.toLowerCase()] = {
        summary: endpoint.summary,
        description: endpoint.description,
        tags: endpoint.tags,
        parameters: endpoint.parameters,
        requestBody: endpoint.requestBody,
        responses: endpoint.responses,
        security: endpoint.security,
      };
    }

    const paths = {};
    for (const [path, methods] of pathMap) {
      paths[path] = methods;
    }

    return {
      openapi: '3.0.0',
      info: {
        title: this.title,
        version: this.version,
        contact: {
          email: this.contactEmail,
        },
      },
      servers: [
        {
          url: this.baseUrl,
          description: 'Production',
        },
      ],
      paths,
      components: {
        schemas: Object.fromEntries(this.schemas),
        securitySchemes: {
          BearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    };
  }

  /**
   * Generate HTML documentation (Swagger UI style)
   */
  generateHTML() {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>${this.title} - API Documentation</title>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Roboto', sans-serif;
            color: #333;
            line-height: 1.6;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 0;
            margin-bottom: 40px;
        }
        h1 { font-size: 2.5em; margin-bottom: 10px; }
        .version { font-size: 0.9em; opacity: 0.9; }
        .endpoint {
            border-left: 4px solid #667eea;
            padding: 20px;
            margin-bottom: 20px;
            background: #f9f9f9;
            border-radius: 4px;
        }
        .method {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-weight: bold;
            margin-right: 10px;
            color: white;
        }
        .method.get { background: #61affe; }
        .method.post { background: #49cc90; }
        .method.put { background: #fca130; }
        .method.delete { background: #f93e3e; }
        .method.patch { background: #50e3c2; }
        .path { font-family: monospace; font-size: 1.1em; }
        .summary { margin-top: 10px; font-weight: bold; color: #333; }
        .description { margin-top: 10px; color: #666; }
        .parameters { margin-top: 15px; }
        .param { margin-left: 20px; margin-bottom: 8px; }
        .param-name { font-family: monospace; color: #667eea; }
        .param-type { color: #999; margin-left: 10px; }
        .responses { margin-top: 15px; }
        .response-code { font-family: monospace; font-weight: bold; }
        footer {
            border-top: 1px solid #ddd;
            margin-top: 40px;
            padding-top: 20px;
            text-align: center;
            color: #666;
        }
    </style>
</head>
<body>
    <header>
        <div class="container">
            <h1>${this.title}</h1>
            <div class="version">Version ${this.version}</div>
        </div>
    </header>
    <div class="container">
        <h2>Endpoints</h2>
        ${Array.from(this.routes.values())
          .map(
            (endpoint) => `
            <div class="endpoint">
                <span class="method ${endpoint.method.toLowerCase()}">${endpoint.method}</span>
                <span class="path">${endpoint.path}</span>
                <div class="summary">${endpoint.summary}</div>
                <div class="description">${endpoint.description}</div>
                ${
                  endpoint.parameters.length > 0
                    ? `<div class="parameters"><strong>Parameters:</strong>${endpoint.parameters
                        .map(
                          (p) =>
                            `<div class="param"><span class="param-name">${p.name}</span> <span class="param-type">${p.in}</span></div>`,
                        )
                        .join('')}</div>`
                    : ''
                }
                <div class="responses"><strong>Responses:</strong>
                    ${Object.entries(endpoint.responses)
                      .map(
                        ([code, desc]) =>
                          `<div class="response-code">${code}: ${desc.description}</div>`,
                      )
                      .join('')}
                </div>
            </div>
        `,
          )
          .join('')}
        <footer>
            <p>Last updated: ${new Date().toISOString()}</p>
            <p>Contact: <a href="mailto:${this.contactEmail}">${this.contactEmail}</a></p>
        </footer>
    </div>
</body>
</html>
    `;
  }

  /**
   * Export documentation
   */
  exportDocumentation(format = 'json') {
    if (format === 'json') {
      return JSON.stringify(this.generateOpenAPI(), null, 2);
    }

    if (format === 'html') {
      return this.generateHTML();
    }

    throw new Error(`Unsupported format: ${format}`);
  }

  /**
   * Get endpoint count by method
   */
  getStats() {
    const stats = { total: 0, byMethod: {}, byTag: {} };

    for (const endpoint of this.routes.values()) {
      stats.total++;
      stats.byMethod[endpoint.method] = (stats.byMethod[endpoint.method] || 0) + 1;
      endpoint.tags.forEach((tag) => {
        stats.byTag[tag] = (stats.byTag[tag] || 0) + 1;
      });
    }

    return stats;
  }
}

module.exports = { APIDocGenerator };
