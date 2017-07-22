const express = require('express');
const bodyParser = require('body-parser');

function tableUrl(basePath, table) {
  return `${basePath}/${table.tableName.toLowerCase()}`;
}

function setupSwagger (app, apiBasePath, apiInfo, apiDocs) {
  const swaggerPath = express();

  // http://localhost:8641/v1/api-docs

  app.use("/swagger", swaggerPath);
  const swagger = require('swagger-node-express').createNew(swaggerPath);
  app.use(express.static('swagger-ui'));

  swagger.setApiInfo(apiInfo);

  app.get('/', (req, res) => {
    res.sendFile(__dirname + '/swagger-ui/index.html');
  });

  swagger.configureSwaggerPaths('', 'api-docs', '');
  swagger.configure(`http://localhost.${PORT}`, '0.0.1');

  swaggerPath.get('/api-docs', (req, res) => {
    res.send(apiDocs);
  });
}

function apiDocsTemplate(basePath) {
  return {
    swagger: "2.0",
    info: {
      version: "1.0.0",
      title: "spec",
      description: "Swagger spec",
      termsOfService: ""
    },
    basePath: basePath,
    schemes: ["http"],
    consumes: ["application/json"],
    produces: ["application/json"],
    paths: {

    },

  };
}

module.exports = {
  generate: (app, basePath, tables, apiInfo) => {

    tables.forEach((table) => {
      // Create
      app.post(tableUrl(basePath, table), function* (req, res) {
        const item =
          yield table
            .query()
            .insert(req.body);

        res.send(item);
      });

      // Get all
      app.get(tableUrl(basePath, table), function* (req, res) {
        const items =
          yield table
            .query();

        res.send(items);
      });

      // Get one
      app.get(tableUrl(basePath, table) + '/:id', function* (req, res) {
        const item =
          yield table
            .query()
            .findById(req.params.id);
        
        res.send(item);
      });

      // Update
      app.patch(tableUrl(basePath, table) + '/:id', function* (req, res) {
        const item =
          yield table
            .query()
            .patchAndFetchById(req.params.id, req.body);

        res.send(item);
      });

      // Delete
      app.delete(tableUrl(basePath, table) + '/:id', function* (req, res) {
        yield table
          .query()
          .deleteById(req.params.id);

        res.send({});
      });
    });

    setupSwagger(app, basePath, apiInfo, apiDocs);

  }
};
















