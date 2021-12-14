# psycopg2
![](../../images/psycopg2-logo.png)

- [psycopg2](#psycopg2)
    - [Introduction](#introduction)
    - [Requirements](#requirements)
      - [Installation](#installation)
      - [Pip install](#pip-install)
      - [Source install](#source-install)
      - [Usage](#usage)
    - [CommenterCursorFactory](#commentercursorfactory)
      - [with_openCensus=True](#with_opencensustrue)
    - [Expected fields](#expected-fields)
      - [Default options with flask](#default-options-with-flask)
    - [End to end examples](#end-to-end-examples)
      - [Source code](#source-code)
        - [With OpenCensus](#with-opencensus)
        - [With DB Driver](#with-db-driver)
        - [With DB API Level](#with-db-api-level)
        - [With DB API Thread Safety](#with-db-api-thread-safety)
        - [With Driver Parameter Style](#with-driver-parameter-style)
        - [With libpq Version](#with-libpq-version)
      - [Results](#results)
        - [With OpenCensus](#with-opencensus-1)
        - [With DB Driver](#with-db-driver-1)
        - [With DB API Level](#with-db-api-level-1)
        - [With DB API Thread Safety](#with-db-api-thread-safety-1)
        - [With Driver Parameter Style](#with-driver-parameter-style-1)
        - [With libpq Version](#with-libpq-version-1)
    - [With Flask](#with-flask)
    - [References](#references)

## Introduction

This package is in the form of a [psycopg2 cursor factory](http://initd.org/psycopg/docs/advanced.html#connection-and-cursor-factories) whose purpose is to augment a SQL statement right before execution, with information about the driver and user code to help correlate user code with executed SQL statements.

We provide a `CommenterCursorFactory` that takes options such as
```python
CommenterCursorFactory(with_opencensus=<True or False>)
```

We provide options such as `with_opencensus` because
>Since OpenCensus [`trace_id`](https://opencensus.io/tracing/span/traceid) and [`span_id`](https://opencensus.io/tracing/span/spanid/) are highly ephemeral, including them in SQL comments will likely break any form of statement-based caching that doesn't strip out comments.

## Requirements

| Requirement                | Restriction                              |
| -------------------------- | ---------------------------------------- |
| psycopg2 **(any version)** | <http://initd.org/psycopg/docs/index.html> |
| Python **(any version)**   | <https://www.python.org/downloads/>        |

## Installation
This cursor factory can be installed by any of the following:

### Pip install
```
pip3 install opentelemetry-sqlcommenter
```

### Source install
```
git clone https://github.com/open-telemetry/opentelemetry-sqlcommenter.git
cd python/sqlcommenter-python && python3 setup.py install
```

### Usage
We'll perform the following imports in our source code:

## CommenterCursorFactory

`CommenterCursorFactory` is a factory for a `cursor_factory` that when used to create a psycopg2.Connection engine will grab information about your application and augment it as a comment to your SQL statement.

```python
import psycopg2
from opentelemetry.sqlcommenter.psycopg2.extension import CommenterCursorFactory

conn = psycopg2.connect(..., cursor_factory=CommenterCursorFactory())
```

### with_openCensus=True

To enable the comment cursor to also attach information about the current OpenCensus span (if any exists), pass in option `with_opencensus=True` when invoking `CommenterCursorFactory`, so

```python
conn = psycopg2.connect(..., cursor_factory=CommenterCursorFactory(with_opencensus=True))
```

## Expected fields

| Field                | Description                                                                                                                                                                                    | Included by default                            |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| `db_driver`          | The underlying database driver e.g. `'psycopg2'`                                                                                                                                               | <div style="text-align: center">&#10060;</div> |
| `dbapi_threadsafety` | The threadsafety API assignment e.g. 2                                                                                                                                                         | <div style="text-align: center">&#10060;</div> |
| `driver_paramstyle`  | The Python DB API style of parameters e.g. `pyformat`                                                                                                                                          | <div style="text-align: center">&#10060;</div> |
| `libpq_version`      | The underlying version of [libpq]() that was used by psycopg2                                                                                                                                  | <div style="text-align: center">&#10060;</div> |
| `traceparent`        | The [W3C TraceContext.Traceparent field](https://www.w3.org/TR/trace-context/#traceparent-field) of the OpenCensus trace -- optionally defined with [`with_opencensus=True`](#with-opencensus) | <div style="text-align: center">&#10060;</div> |
| `tracestate`         | The [W3C TraceContext.Tracestate field](https://www.w3.org/TR/trace-context/#tracestate-field) of the OpenCensus trace -- optionally defined with [`with_opencensus=True`](#with-opencensus)   | <div style="text-align: center">&#10060;</div> |

### Default options with flask
If combined with [Flask](../flask), the following options will be turned on by default

| Field        | Description                         | \*\*kwargs field name |
| ------------ | ----------------------------------- | --------------------- |
| `controller` | Grabs the controller being used     | `with_controller`     |
| `framework`  | Grabs the framework and its version | `with_framework`      |
| `route`      | Grabs the route being used          | `with_route`          |

## End to end examples

### Source code

#### With OpenCensus
```python
#!/usr/bin/env python3

import psycopg2
from opentelemetry.sqlcommenter.psycopg2.extension import CommenterCursorFactory

from opencensus.trace.samplers import AlwaysOnSampler
from opencensus.trace.tracer import Tracer

DSN = '...'  # DB connection info

class NoopExporter():
    def emit(self, *args, **kwargs):
        pass

    def export(self, *args, **kwargs):
        pass

def main():
    tracer = Tracer(exporter=NoopExporter, sampler=AlwaysOnSampler())
    cursor_factory = CommenterCursorFactory(with_opencensus=True)

    with tracer.span():
        with psycopg2.connect(DSN, cursor_factory=cursor_factory) as conn:
            with conn.cursor() as cursor:
                cursor.execute("SELECT * FROM polls_question")
                for row in cursor:
                    print(row)

if __name__ == '__main__':
    main()
```

#### With DB Driver
```python
#!/usr/bin/env python3

import psycopg2
from opentelemetry.sqlcommenter.psycopg2.extension import CommenterCursorFactory

DSN = '...'  # DB connection info

def main():
    cursor_factory = CommenterCursorFactory(with_db_driver=True)

    with psycopg2.connect(DSN, cursor_factory=cursor_factory) as conn:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM polls_question")
            for row in cursor:
                print(row)

if __name__ == '__main__':
    main()
```

#### With DB API Level
```python
#!/usr/bin/env python3

import psycopg2
from opentelemetry.sqlcommenter.psycopg2.extension import CommenterCursorFactory

DSN = '...'  # DB connection info

def main():
    cursor_factory = CommenterCursorFactory(with_dbapi_level=True)

    with psycopg2.connect(DSN, cursor_factory=cursor_factory) as conn:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM polls_question")
            for row in cursor:
                print(row)

if __name__ == '__main__':
    main()
```

#### With DB API Thread Safety
```python
#!/usr/bin/env python3

import psycopg2
from opentelemetry.sqlcommenter.psycopg2.extension import CommenterCursorFactory

DSN = '...'  # DB connection info

def main():
    cursor_factory = CommenterCursorFactory(with_dbapi_threadsafety=True)

    with psycopg2.connect(DSN, cursor_factory=cursor_factory) as conn:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM polls_question")
            for row in cursor:
                print(row)

if __name__ == '__main__':
    main()
```

#### With Driver Parameter Style
```python
#!/usr/bin/env python3

import psycopg2
from opentelemetry.sqlcommenter.psycopg2.extension import CommenterCursorFactory

DSN = '...'  # DB connection info

def main():
    cursor_factory = CommenterCursorFactory(with_driver_paramstyle=True)

    with psycopg2.connect(DSN, cursor_factory=cursor_factory) as conn:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM polls_question")
            for row in cursor:
                print(row)

if __name__ == '__main__':
    main()
```

#### With libpq Version
```python
#!/usr/bin/env python3

import psycopg2
from opentelemetry.sqlcommenter.psycopg2.extension import CommenterCursorFactory

DSN = '...'  # DB connection info

def main():
    cursor_factory = CommenterCursorFactory(with_libpq_version=True)

    with psycopg2.connect(DSN, cursor_factory=cursor_factory) as conn:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM polls_question")
            for row in cursor:
                print(row)

if __name__ == '__main__':
    main()
```

```shell
python3 main.py
(1, 'Wassup?', datetime.datetime(2019, 5, 30, 13, 51, 12, 910545, tzinfo=psycopg2.tz.FixedOffsetTimezone(offset=-420, name=None)))
(2, 'Wassup?', datetime.datetime(2019, 5, 30, 13, 57, 45, 905771, tzinfo=psycopg2.tz.FixedOffsetTimezone(offset=-420, name=None)))
(3, 'Wassup?', datetime.datetime(2019, 5, 30, 13, 57, 46, 908185, tzinfo=psycopg2.tz.FixedOffsetTimezone(offset=-420, name=None)))
(4, 'Wassup?', datetime.datetime(2019, 5, 30, 13, 57, 47, 557196, tzinfo=psycopg2.tz.FixedOffsetTimezone(offset=-420, name=None)))
(5, 'Wassup?', datetime.datetime(2019, 5, 30, 13, 57, 47, 853424, tzinfo=psycopg2.tz.FixedOffsetTimezone(offset=-420, name=None)))
```

### Results

Examining our Postgresql server logs, with the various options

#### With OpenCensus
```
2019-07-17 15:45:12.254 -03 [16353] LOG:  statement: SELECT * FROM polls_question
/*traceparent='00-fdda4e35e3083efdd6ee9ca4df5f3402-b3139d365faa0f43-01'*/
```

#### With DB Driver
```
2019-07-17 15:56:05.192 -03 [16491] LOG:  statement: SELECT * FROM polls_question
/*db_driver='psycopg2%3A2.8.3%20%28dt%20dec%20pq3%20ext%20lo64%29'*/
```

##### With DB API Level
```
2019-07-17 15:59:45.935 -03 [16566] LOG:  statement: SELECT * FROM polls_question
/*dbapi_level='2.0'*/
```

#### With DB API Thread Safety
```
2019-07-17 16:01:15.533 -03 [16600] LOG:  statement: SELECT * FROM polls_question
/*dbapi_threadsafety=2*/
```

#### With Driver Parameter Style
```
2019-07-17 16:03:54.687 -03 [16652] LOG:  statement: SELECT * FROM polls_question
/*driver_paramstyle='pyformat'*/
```

#### With libpq Version
```
2019-07-17 16:05:37.618 -03 [16708] LOG:  statement: SELECT * FROM polls_question
/*libpq_version=110002*/
```

## With Flask
When coupled with the web framework [Flask](http://flask.pocoo.org), we still provide a function (`opentelemetry.sqlcommenter.flask.get_flask_info`) to correlate your web applications with your SQL statements from psycopg2.
This function is integrated in `CommenterCursorFactory`.
[![](../../images/flask-logo.png)](../flask/#with-psycopg2)
## References

| Resource                        | URL                                                |
| ------------------------------- | -------------------------------------------------- |
| psycopg2 project                | <http://initd.org/psycopg/docs/index.html>           |
| sqlcommenter-psycopg2 on PyPi   | <https://pypi.org/project/opentelemetry-sqlcommenter> |
| sqlcommenter-psycopg2 on Github | <https://github.com/open-telemetry/opentelemetry-sqlcommenter>             |
| OpenCensus                      | <https://opencensus.io/>                             |
| OpenCensus SpanID               | <https://opencensus.io/tracing/span/spanid>          |
| OpenCensus TraceID              | <https://opencensus.io/tracing/span/traceid>         |