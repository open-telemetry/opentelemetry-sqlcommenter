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

const hooks = require('async_hooks')
const store = new Map();

const hook = hooks.createHook({
    init: (asyncId, _, triggerAsyncId) => {
        if (store.has(triggerAsyncId)) {
            store.set(asyncId, store.get(triggerAsyncId))
        }
    },
    destroy: (asyncId) => {
        if (store.has(asyncId)) {
            store.delete(asyncId)
        }
    }
});

hook.enable();

const createContext = (data) => {
    store.set(hooks.executionAsyncId(), data);
    return data;
};

const getContext = () => {
    return store.get(hooks.executionAsyncId());
};

module.exports = { createContext, getContext };
