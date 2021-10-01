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

RSpec.describe Marginalia::Comment do # rubocop:disable RSpec/FilePath
  describe 'framework' do
    it 'is set to the correct Rails version' do
      expect(described_class.framework).to eq("rails_v#{Rails::VERSION::STRING}")
    end
  end
end
