#!/usr/bin/python
#
# Copyright The OpenTelemetry Authors
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import os
import time

from opentelemetry import trace
from opentelemetry.exporter.cloud_trace import CloudTraceSpanExporter
from opentelemetry.instrumentation.psycopg2 import Psycopg2Instrumentor
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import (BatchSpanProcessor,
                                            ConsoleSpanExporter,
                                            SimpleSpanProcessor)

# Set up OpenTelemetry tracing
trace.set_tracer_provider(TracerProvider())
trace.get_tracer_provider().add_span_processor(
    SimpleSpanProcessor(ConsoleSpanExporter())
)
trace.get_tracer_provider().add_span_processor(
    BatchSpanProcessor(CloudTraceSpanExporter(), schedule_delay_millis=5000)
)

# Trace postgres queries as well
Psycopg2Instrumentor().instrument()

import psycopg2
from google.cloud.sqlcommenter.psycopg2.extension import CommenterCursorFactory

tracer = trace.get_tracer(__name__)


def main():
    cursor_factory = CommenterCursorFactory(
        with_db_driver=True,
        with_dbapi_level=True,
        with_dbapi_threadsafety=True,
        with_driver_paramstyle=True,
        with_libpq_version=True,
        with_opentelemetry=True,
    )
    conn = psycopg2.connect(
        os.environ["POSTGRES_DSN"],
        cursor_factory=cursor_factory,
    )

    with tracer.start_as_current_span("create data"):
        with conn, conn.cursor() as cursor:
            table_exists = True
            with tracer.start_as_current_span("check if table exists"):
                try:
                    cursor.execute('SELECT 1 FROM "names"')
                except psycopg2.DatabaseError:
                    table_exists = False
        with conn, conn.cursor() as cursor:
            if not table_exists:
                with tracer.start_as_current_span("create_table"):
                    cursor.execute("CREATE TABLE names (name text PRIMARY KEY)")
                    cursor.execute(
                        """
                        INSERT INTO "names" VALUES
                            ('John'), ('Jane'), ('Jess')
                        """
                    )

    for _ in range(10000):
        with tracer.start_as_current_span("send postgres query"):
            with conn.cursor() as cursor:
                cursor.execute("SELECT * FROM names")
        time.sleep(0.5)


if __name__ == "__main__":
    main()
