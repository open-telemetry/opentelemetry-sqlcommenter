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

const { LogLevel } = require("@opentelemetry/core");
const { NodeTracerProvider } = require("@opentelemetry/node");
const { BatchSpanProcessor } = require("@opentelemetry/tracing");
const {
  TraceExporter,
} = require("@google-cloud/opentelemetry-cloud-trace-exporter");
const { logger, sleep } = require("./util");

const tracerProvider = new NodeTracerProvider({
  logLevel: LogLevel.DEBUG,
  logger,
});
tracerProvider.addSpanProcessor(
  new BatchSpanProcessor(new TraceExporter({ logger }), {
    bufferSize: 500,
    bufferTimeout: 5 * 1000,
  })
);
tracerProvider.register();

// OpenTelemetry initialization should happen before importing any libraries
// that it instruments
const express = require("express");
const app = express();
const { sqlcommenterMiddleware, knex } = require("./knexConnection");

const tracer = tracerProvider.getTracer(__filename);

async function main() {
  if (!(await knex.schema.hasTable("Todos"))) {
    console.error("Todos table does not exist. Run `npm run createTodos`");
    process.exit(1);
  }

  const PORT = 8000;

  // SQLCommenter express middleware injects the route into the traces
  app.use(sqlcommenterMiddleware);

  app.get("/", async (req, res) => {
    const span = tracer.startSpan("sleep for no reason (parent)");
    await sleep(250);
    span.end();

    const getRecordsSpan = tracer.startSpan("query records with knex");
    await tracer.withSpan(getRecordsSpan, async () => {
      tracer.startSpan("testing 123").end();
      const todos = await knex.select().table("Todos").limit(20);
      const countByDone = await knex
        .select("done", knex.raw("COUNT(id) as count"))
        .table("Todos")
        .groupBy("done");
      res.json({ countByDone, todos });
    });
    getRecordsSpan.end();
  });
  app.listen(PORT, async () => {
    console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`);
  });
}

main().catch(console.error);
