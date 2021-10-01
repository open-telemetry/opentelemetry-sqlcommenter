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

from contextlib import contextmanager

try:
    from opentelemetry import context, trace

    @contextmanager
    def mock_opentelemetry_context(
        trace_id=0xDEADBEEF, span_id=0xBEEF, trace_flags=None, trace_state=None
    ):
        if trace_state is None:
            trace_state = [("some_key", "some_value")]

        span_context = trace.SpanContext(
            trace_id=trace_id,
            span_id=span_id,
            is_remote=True,
            trace_flags=trace_flags,
            trace_state=trace.TraceState(trace_state),
        )
        ctx = trace.set_span_in_context(trace.span.NonRecordingSpan(span_context))
        token = context.attach(ctx)
        try:
            yield
        finally:
            context.detach(token)


except ImportError:
    # python2.7 tests will not have opentelemetry installed
    @contextmanager
    def mock_opentelemetry_context(*args, **kwargs):
        yield
