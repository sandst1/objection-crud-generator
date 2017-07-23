const express = require('express');
const bodyParser = require('body-parser');

function tableUrl(basePath, table) {
  return `${basePath}/${table.tableName.toLowerCase()}`;
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
  }
};
















