#!/usr/bin/ruby
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

# frozen_string_literal: true

module Marginalia
  module Comment
    # @return [String, nil]
    def self.traceparent

      current_span = ::OpenTelemetry::Trace.current_span
      return if current_span == ::OpenTelemetry::Trace::Span::INVALID

      span_context = current_span.context
      trace_flag   = span_context.trace_flags.sampled? ? '01': '00'
      trace_string = format(
        '00-%<trace_id>s-%<span_id>s-%<trace_flags>.2d',
        trace_id: span_context.hex_trace_id,
        span_id: span_context.hex_span_id,
        trace_flags: trace_flag,
      )
    end
  end
end

Marginalia::Comment.components += %i[traceparent]
