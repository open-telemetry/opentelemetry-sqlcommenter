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

class InternalAppController < ActionController::Base
  def simple_query
    OpenCensus::Trace.in_span 'my-span' do |_span|
      ActiveRecord::Base.connection.select_values 'SELECT 1;'
    end
    head :ok
  end
end
