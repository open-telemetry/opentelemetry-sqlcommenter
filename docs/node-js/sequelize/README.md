# Sequelize
![](../../images/sequelize-logo.png)
<style>
    img[src*='/sequelize-logo.png']
    {
        max-height:50%;
        display: block;
        max-width: 50%;
    }
</style>
- [Sequelize](#sequelize)
  - [Introduction](#introduction)
  - [Requirements](#requirements)
  - [Installation](#installation)
    - [Manually](#manually)
    - [Package manager](#package-manager)
  - [Usage](#usage)
    - [Plain sequelize wrapper](#plain-sequelize-wrapper)
    - [Express middleware](#express-middleware)
  - [Fields](#fields)
    - [Options](#options)
      - [`include` config](#include-config)
      - [`options` config](#options-config)
      - [Options examples](#options-examples)
        - [trace attributes](#trace-attributes)
        - [client_timezone](#client_timezone)
        - [route](#route)
        - [db_driver](#db_driver)
        - [all set](#all-set)
  - [End to end examples](#end-to-end-examples)
    - [Source code](#source-code)
      - [With OpenCensus](#with-opencensus)
      - [With OpenTelemetry](#with-opentelemetry)
      - [With route](#with-route)
      - [With DB Driver and CLIENT TIMEZONE](#with-db-driver-and-client-timezone)
      - [With All Options Set](#with-all-options-set)
  - [Results](#results)
    - [With OpenCensus](#with-opencensus-1)
    - [With Route](#with-route-1)
    - [With DB Driver and CLIENT TIMEZONE](#with-db-driver-and-client-timezone-1)
    - [With All Set](#with-all-set)
  - [References](#references)

## Introduction

This package is in the form of `Sequelize.Client.prototype.query` wrapper whose purpose is to augment a SQL statement right before execution, with
information about the controller and user code to help correlate them with SQL statements emitted by Sequelize.js.

Besides plain sequelize.js wrapping, we also provide a wrapper for the following frameworks:

[![](../../images/express_js-logo.png)](../express)

## Requirements

* [Sequelize.js](http://docs.sequelizejs.com/)
* [Node.js](https://nodejs.org/)

## Installation

We can add integration into our applications in the following ways:

### Manually

Please read [installing sqlcommenter-nodejs from source](../#from-source)

### Package manager
Add to your package.json the dependency
```json
{
    "@opentelemetry/sqlcommenter-sequelize": "*"
}
```
and then run `npm install` to get the latest version or

```shell
npm install @opentelemetry/sqlcommenter-sequelize --save
```

## Usage
### Plain sequelize wrapper
```javascript
const {wrapSequelize} = require('@opentelemetry/sqlcommenter-sequelize');
const Sequelize = require('sequelize');

// Create the sequelize client.
const sequelize = new Sequelize(options);

// Finally wrap the sequelize client.
wrapSequelize(sequelize);
```
### Express middleware
This wrapper/middleware can be used as is or better with [express.js](https://expressjs.com/)
```javascript
const {wrapSequelizeAsMiddleware} = require('@opentelemetry/sqlcommenter-sequelize');
const Sequelize = require('sequelize');
const sequelize = new Sequelize(options);
const app = require('express')();

// Use the sequelize+express middleware.
app.use(wrapSequelizeAsMiddleware(sequelize));
```
## Fields

In the database server logs, the comment's fields are:

* comma separated key-value pairs e.g. `route='%5E%2Fpolls%2F'`
* values are SQL escaped i.e. `key='value'`
* URL-quoted except for the equals(`=`) sign e.g `route='%5Epolls/%24'`. so should be URL-unquoted

| Field             | Format                 | Description                                                                                          | Example                                                                 |
|-------------------|------------------------|------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------|
| `client_timezone` | `<string>`             | URL quoted name of the timezone used when converting a date from the database into a JavaScript date | `'+00:00'`                                                              |
| `db_driver`       | `<sequelize>`          | URL quoted name and version of the database driver                                                   | `db_driver='sequelize'`                                                 |
| `route`           | `<the route used>`     | URL quoted route used to match the express.js controller                                             | `route='%5E%2Fpolls%2F`                                                 |
| `traceparent`     | `<traceparent header>` | URL quoted [W3C `traceparent` header](https://www.w3.org/TR/trace-context/#traceparent-header)       | `traceparent='00-3e2914ebce6af09508dd1ff1128493a8-81d09ab4d8cde7cf-01'` |
| `tracestate`      | `<tracestate header>`  | URL quoted [W3C `tracestate` header](https://www.w3.org/TR/trace-context/#tracestate-header)         | `tracestate='rojo%253D00f067aa0ba902b7%2Ccongo%253Dt61rcWkgMzE'`        |

### Options
When creating the middleware, one can optionally configure the injected
comments by passing in the `include` and `options` objects:

```javascript
wrapMainSequelizeAsMiddleware(Sequelize, include={...}, options={...});
```

#### `include` config
A map of values to be optionally included in the SQL comments.

| Field           | On by default |
|-----------------|---------------|
| client_timezone | &#10060; |
| db_driver       | &#10060; |
| route           | &#10004; |
| traceparent     | &#10060; |
| tracestate      | &#10060; |

#### `options` config
A configuration object specifying where to collect trace data from. Accepted
fields are: TraceProvider: Should be either `OpenCensus` or `OpenTelemetry`,
indicating which library to collect trace context from.

| Field         | Possible values                 |
|---------------|---------------------------------|
| TraceProvider | `OpenCensus` or `OpenTelemetry` |

#### Options examples
##### trace attributes

```javascript
wrapMainSequelizeAsMiddleware(
    Sequelize,
    include={ traceparent: true, tracestate: true },
    options={ TraceProvider: 'OpenTelemetry' }
);
```
##### client_timezone
```javascript
wrapMainSequelizeAsMiddleware(Sequelize, include={client_timezone: true});
```
##### route
```javascript
wrapMainSequelizeAsMiddleware(Sequelize, include={route: true});
```
##### db_driver
```javascript
wrapMainSequelizeAsMiddleware(Sequelize, include={db_driver: true});
```
##### all set
```javascript
// Manually set all the variables.
wrapMainSequelizeAsMiddleware(
    Sequelize,
    include={
        client_timezone: true,
        db_driver: true,
        route: true,
        traceparent: true,
        tracestate: true,
    },
    options={ TraceProvider: 'OpenTelemetry' }
);
```

## End to end examples

Check out a full express + opentelemetry example
[here](https://github.com/open-telemetry/opentelemetry-sqlcommenter/tree/main/nodejs/sqlcommenter-nodejs/samples/express-opentelemetry).

### Source code
#### With OpenCensus

```javascript
// In file app.js.
const tracing = require('@opencensus/nodejs');
const {B3Format} = require('@opencensus/propagation-b3');
const {ZipkinTraceExporter} = require('@opencensus/exporter-zipkin');
const {wrapSequelizeAsMiddleware} = require('@opentelemetry/sqlcommenter-sequelize');
const Sequelize = require('sequelize');
const express = require('express');

const exporter = new ZipkinTraceExporter({
    url: process.env.ZIPKIN_TRACE_URL || 'localhost://9411/api/v2/spans',
    serviceName: 'trace-542'
});

const b3 = new B3Format();
const traceOptions = {
    samplingRate: 1, // Always sample
    propagation: b3,
    exporter: exporter
};

// start tracing
tracing.start(traceOptions);

// Using a connection URI
const sequelize = new Sequelize('postgres://user:pass@example.com:5432/dbname');

const app = express();
const port = process.env.APP_PORT || 3000;

// Use the sequelize+express middleware with trace attributes 
app.use(wrapSequelizeAsMiddleware(
    sequelize,
    { traceparent: true, tracestate: true, route: false },
    { TraceProvider: "OpenCensus" },
));

app.get('/', (req, res) => res.send('Hello, sqlcommenter-nodejs!!'));
app.get('^/polls/:param', function(req, res) {
    sequelize.query('SELECT * from polls_question').then(function(polls) {
        const blob = JSON.stringify(polls);
        res.send(blob);
    }).catch(function(err) {
        console.log(err);
        res.send(500);
    });
});
app.listen(port, () => console.log(`Application listening on ${port}`));
```
#### With OpenTelemetry
```javascript
// In file app.js.
const { NodeTracerProvider } = require("@opentelemetry/node");
const { BatchSpanProcessor } = require("@opentelemetry/tracing");
const {
  TraceExporter,
} = require("@opentelemetry/opentelemetry-cloud-trace-exporter");

const tracerProvider = new NodeTracerProvider();
// Export to Opentelemetry Trace
tracerProvider.addSpanProcessor(
  new BatchSpanProcessor(new TraceExporter({ logger }), {
    bufferSize: 500,
    bufferTimeout: 5 * 1000,
  })
);
tracerProvider.register();

// OpenTelemetry initialization should happen before importing any libraries
// that it instruments
const { Sequelize } = require("sequelize");
const {
  wrapSequelizeAsMiddleware,
} = require("@opentelemetry/sqlcommenter-sequelize");

const sequelize = new Sequelize("postgres://user:pass@example.com:5432/dbname");

const express = require("express");
const app = express();
const port = process.env.APP_PORT || 3000;

// SQLCommenter express middleware injects the route into the traces
app.use(
  wrapSequelizeAsMiddleware(
    sequelize,
    {
      client_timezone: true,
      db_driver: true,
      route: true,
      traceparent: true,
      tracestate: true,
    },
    { TraceProvider: "OpenTelemetry" }
  )
);

app.get("/", (req, res) => res.send("Hello, sqlcommenter-nodejs!!"));
app.get("^/polls/:param", function (req, res) {
  sequelize
    .query("SELECT * from polls_question")
    .then(function (polls) {
      const blob = JSON.stringify(polls);
      res.send(blob);
    })
    .catch(function (err) {
      console.log(err);
      res.send(500);
    });
});
app.listen(port, () => console.log(`Application listening on ${port}`));
```

#### With route
```javascript
// In file app.js.
const Sequelize = require('sequelize');
const {wrapSequelizeAsMiddleware} = require('@opentelemetry/sqlcommenter-sequelize');
const express = require('express');

// Using a connection URI
const sequelize = new Sequelize('postgres://user:pass@example.com:5432/dbname');

const app = express();
const port = process.env.APP_PORT || 3000;

// Use the sequelize+express middleware with route
app.use(wrapSequelizeAsMiddleware(sequelize, {route: true}));

app.get('/', (req, res) => res.send('Hello, sqlcommenter-nodejs!!'));
app.get('^/polls/:param', function(req, res) {
    sequelize.query('SELECT * from polls_question').then(function(polls) {
        const blob = JSON.stringify(polls);
        res.send(blob);
    }).catch(function(err) {
        console.log(err);
        res.send(500);
    });
});
app.listen(port, () => console.log(`Application listening on ${port}`));
```
#### With DB Driver and CLIENT TIMEZONE
```javascript
// In file app.js
const Sequelize = require('sequelize');
const {wrapSequelizeAsMiddleware} = require('@opentelemetry/sqlcommenter-sequelize');
const express = require('express');

// Using a connection URI
const sequelize = new Sequelize('postgres://user:pass@example.com:5432/dbname');

const app = express();
const port = process.env.APP_PORT || 3000;

// Use the sequelize+express middleware with db driver and timezone
app.use(wrapSequelizeAsMiddleware(sequelize, {
    db_driver: true, 
    client_timezone: true
}));

app.get('/', (req, res) => res.send('Hello, sqlcommenter-nodejs!!'));
app.get('^/polls/:param', function(req, res) {
    sequelize.query('SELECT * from polls_question').then(function(polls) {
        const blob = JSON.stringify(polls);
        res.send(blob);
    }).catch(function(err) {
        console.log(err);
        res.send(500);
    });
});
app.listen(port, () => console.log(`Application listening on ${port}`));
```
#### With All Options Set
```javascript
// In file app.js.
const tracing = require('@opencensus/nodejs');
const {B3Format} = require('@opencensus/propagation-b3');
const {ZipkinTraceExporter} = require('@opencensus/exporter-zipkin');
const Sequelize = require('sequelize');
const {wrapSequelizeAsMiddleware} = require('@opentelemetry/sqlcommenter-sequelize');
const express = require('express');

const exporter = new ZipkinTraceExporter({
    url: process.env.ZIPKIN_TRACE_URL || 'localhost:9411/api/v2/spans',
    serviceName: 'trace-542'
});

const b3 = new B3Format();
const traceOptions = {
    samplingRate: 1, // Always sample
    propagation: b3,
    exporter: exporter
};

// start tracing
tracing.start(traceOptions);

// Using a connection URI
const sequelize = new Sequelize('postgres://user:pass@example.com:5432/dbname');

const app = express();
const port = process.env.APP_PORT || 3000;

// Use the sequelize+express middleware with all attributes set
app.use(wrapSequelizeAsMiddleware(
    sequelize,
    {
        traceparent: true,
        tracestate: true,

        // Optional
        route: false,
        db_driver: false,
        client_timezone: false
    },
    {
        TraceProvider: "OpenCensus",
    },
));

app.get('/', (req, res) => res.send('Hello, sqlcommenter-nodejs!!'));
app.get('^/polls/:param', function(req, res) {
    sequelize.query('SELECT * from polls_question').then(function(polls) {
        const blob = JSON.stringify(polls);
        res.send(blob);
    }).catch(function(err) {
        console.log(err);
        res.send(500);
    });
});
app.listen(port, () => console.log(`Application listening on ${port}`));
```

which after running by
```shell
$ node app.js 
Application listening on 3000
```

## Results

On making a request to that server at `http://localhost:3000/polls/1000`, the PostgreSQL logs show:

### With OpenCensus
```shell
2019-06-03 14:32:10.842 PDT [32004] LOG:  statement: SELECT * from polls_question 
/*traceparent='00-11000000000000ff-020000ee-01',tracestate='brazzaville=t61rcWkgMzE,rondo=00f067aa0ba902b7'*/
```

### With Route
```shell
2019-06-03 14:32:10.842 PDT [32004] LOG:  statement: SELECT * from polls_question 
/*route='%5E%2Fpolls%2F%1000'*/
```

### With DB Driver and CLIENT TIMEZONE
```shell
2019-06-03 14:32:10.842 PDT [32004] LOG:  statement: SELECT * from polls_question 
/*client_timezone:'%2B00%3A00',db_driver='sequelize%3A0.0.1'*/
```

### With All Set
```shell
2019-06-03 14:32:10.842 PDT [32004] LOG:  statement: SELECT * from polls_question 
/*client_timezone:'%2B00%3A00',db_driver='sequelize%3A0.0.1',route='%5E%2Fpolls%2F%1000',traceparent='00-11000000000000ff-020000ee-01',tracestate='brazzaville=t61rcWkgMzE,rondo=00f067aa0ba902b7'*/
```

## References

| Resource                                    | URL                                                                |
|---------------------------------------------|--------------------------------------------------------------------|
| @opentelemetry/sqlcommenter-sequelize on npm | <https://www.npmjs.com/package/@opentelemetry/sqlcommenter-sequelize> |
| express.js                                  | <https://expressjs.com/>                                             |