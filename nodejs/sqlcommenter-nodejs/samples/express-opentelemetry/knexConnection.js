// Copyright The OpenTelemetry Authors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const { wrapMainKnexAsMiddleware } = require("@google-cloud/sqlcommenter-knex");
const Knex = require("knex");

const sqlcommenterMiddleware = wrapMainKnexAsMiddleware(
  Knex,
  {
    traceparent: true,
    tracestate: true,

    // These are optional and will cause a high cardinality burst traced queries
    db_driver: false,
    route: false,
  },
  { TraceProvider: "OpenTelemetry" }
);

const knex = Knex({
  client: "pg",
  connection: {
    host: process.env.DBHOST,
    user: process.env.DBUSERNAME,
    password: process.env.DBPASSWORD,
    database: "postgres",
  },
});

module.exports = {
  knex,
  sqlcommenterMiddleware,
};
