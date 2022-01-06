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

package io.opentelemetry.sqlcommenter.threadlocalstorage;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.annotation.Nullable;

public class SpanContextMetadata {
  private static final Logger logger = Logger.getLogger(SpanContextMetadata.class.getName());
  private static final String UTF8 = StandardCharsets.UTF_8.toString();

  private final String traceId;
  private final String spanId;
  private final byte traceOptions;
  private final String traceState;

  private SpanContextMetadata(
      String traceId, String spanId, byte traceOptions, @Nullable String traceState) {
    this.traceId = traceId;
    this.spanId = spanId;
    this.traceOptions = traceOptions;
    this.traceState = traceState;
  }

  public static SpanContextMetadata fromOpenCensusContext(
      io.opencensus.trace.SpanContext spanContext) {
    if (spanContext == null || !spanContext.isValid()) {
      return null;
    }
    String traceId = spanContext.getTraceId().toLowerBase16();
    String spanId = spanContext.getSpanId().toLowerBase16();
    byte traceOptions = spanContext.getTraceOptions().getByte();

    io.opencensus.trace.Tracestate traceState = spanContext.getTracestate();

    if (traceState.getEntries().isEmpty()) {
      return new SpanContextMetadata(traceId, spanId, traceOptions, null);
    }

    // Tracestate needs to be serialized in the order of the entries.
    ArrayList<String> pairsList = new ArrayList<>();
    for (io.opencensus.trace.Tracestate.Entry entry : traceState.getEntries()) {
      String key = entry.getKey();
      // Only don't insert if the key is empty.
      if (!key.isEmpty()) {
        try {
          String value = entry.getValue();
          String encoded = URLEncoder.encode((String.format("%s=%s", key, value)), UTF8);
          pairsList.add(encoded);
        } catch (Exception e) {
          logger.log(Level.WARNING, "Exception when encoding Tracestate", e);
        }
      }
    }
    String traceStateStr = String.join(",", pairsList);

    return new SpanContextMetadata(traceId, spanId, traceOptions, traceStateStr);
  }

  public static SpanContextMetadata fromOpenTelemetryContext(
      io.opentelemetry.api.trace.SpanContext spanContext) {
    if (spanContext == null || !spanContext.isValid()) {
      return null;
    }

    String traceId = spanContext.getTraceId();
    String spanId = spanContext.getSpanId();
    byte traceOptions = spanContext.getTraceFlags().asByte();

    io.opentelemetry.api.trace.TraceState traceState = spanContext.getTraceState();

    if (traceState.isEmpty()) {
      return new SpanContextMetadata(traceId, spanId, traceOptions, null);
    }

    ArrayList<String> pairsList = new ArrayList<>();
    Map<String, String> map = traceState.asMap();
    for (String key : map.keySet()) {
      if (key.isEmpty()) {
        continue;
      }

      try {
        String value = map.get(key);
        String encoded = URLEncoder.encode((String.format("%s=%s", key, value)), UTF8);
        pairsList.add(encoded);
      } catch (Exception e) {
        logger.log(Level.WARNING, "Exception when encoding Tracestate", e);
      }
    }
    String traceStateStr = String.join(",", pairsList);

    return new SpanContextMetadata(traceId, spanId, traceOptions, traceStateStr);
  }

  public String getTraceId() {
    return traceId;
  }

  public String getSpanId() {
    return spanId;
  }

  public byte getTraceOptions() {
    return traceOptions;
  }

  public String getTraceState() {
    return traceState;
  }
}
