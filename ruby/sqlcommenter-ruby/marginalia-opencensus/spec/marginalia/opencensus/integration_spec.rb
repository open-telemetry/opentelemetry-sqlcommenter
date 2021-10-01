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

RSpec.feature 'Integration tests', type: :feature do
  before do
    @queries = []
    ActiveSupport::Notifications.subscribe 'sql.active_record' do |_name, _start, _finish, _id, payload|
      @queries << payload[:sql]
    end
  end

  after do
    ActiveSupport::Notifications.unsubscribe 'sql.active_record'
  end

  it 'appends OpenCensus information to the query on request' do
    visit internal_app_simple_query_path
    expect(@queries[0]).to(
      match(%r{
        SELECT[ ]1;[ ]/\*
        application:Combustion,
        controller:internal_app,
        action:simple_query,
        traceparent:[0-9]{2}-[a-z0-9]{32}-[a-z0-9]{16}-[0-9]{2}
        \*/
      }x)
    )
  end
end
