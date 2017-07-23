const express = require('express');
const bodyParser = require('body-parser');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

function tableUrl(basePath, table) {
  return `${basePath}/${table.tableName.toLowerCase()}`;
}

function getSwaggerSpec(apiDoc) {
  const swaggerInfo = {
    swaggerDefinition: {
        info: {
          title: 'Basic REST API',
          version: '1.0.0'
        },
        produces: ['application/json'],
        consumes: ['application/json']
      },
      apis: [
        /*'lib/routes/*.js'*/
      ]
  };

  const spec = swaggerJSDoc(swaggerInfo);
  spec.paths = apiDoc;

  return spec;
}

module.exports = {
  generate: (app, basePath, tables) => {

    const apiDoc = {};

    tables.forEach((table) => {
      const tableDoc = {};

      const tableApiPath = tableUrl(basePath, table);

      // Create
      app.post(tableApiPath, function* (req, res) {
        const item =
          yield table
            .query()
            .insert(req.body);

        res.send(item);
      });
      /**
         * @swagger
         * /users:
         *   post:
         *     description: Returns users
         *     produces:
         *       - application/json
         *     parameters:
         *       - name: user
         *         description: User object
         *         in:  body
         *         required: true
         *         type: string
         *         schema:
         *           $ref: '#/definitions/NewUser'
         *     responses:
         *       200:
         *         description: users
         *         schema:
         *           $ref: '#/definitions/User'
         */      

      tableDoc.post = {
        description: `Creates a new ${table.tableName}`,
        parameters: [{
          name: table.tableName.toLowerCase(),
          in: 'body',
          required: true,
          schema: table.jsonSchema
        }]
      };

      // Get all
      app.get(tableApiPath, function* (req, res) {
        const items =
          yield table
            .query();

        res.send(items);
      });

      tableDoc.get = {
        description: `Gets a list of ${table.tableName}`,
      };      

      // Get one
      app.get(tableApiPath + '/:id', function* (req, res) {
        const item =
          yield table
            .query()
            .findById(req.params.id);
        
        res.send(item);
      });

      tableDoc.get = {
        description: `Gets a single ${table.tableName}`,
        parameters: [{
          name: 'id',
          in: 'path',
          required: true,
          type: 'integer'
        }]
      };   

      // Update
      app.patch(tableApiPath + '/:id', function* (req, res) {
        const item =
          yield table
            .query()
            .patchAndFetchById(req.params.id, req.body);

        res.send(item);
      });

      tableDoc.patch = {
        description: `Updates a ${table.tableName}`,
        parameters: [{
          name: 'id',
          in: 'path',
          required: true,
          type: 'integer'
        }]
      };      

      // Delete
      app.delete(tableApiPath, function* (req, res) {
        yield table
          .query()
          .deleteById(req.params.id);

        res.send({});
      });

      tableDoc.delete = {
        description: `Deletes a ${table.tableName}`,
        parameters: [{
          name: 'id',
          in: 'path',
          required: true,
          type: 'integer'
        }]
      };         

      apiDoc[tableApiPath] = tableDoc;
    });

    // Generate the Swagger documentation

    app.use('/swagger', swaggerUi.serve, swaggerUi.setup(getSwaggerSpec(apiDoc)));

  }
};
















