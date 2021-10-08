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

const { Sequelize, DataTypes } = require("sequelize");
const {
  wrapSequelizeAsMiddleware,
} = require("@google-cloud/sqlcommenter-sequelize");

const sequelize = new Sequelize(
  "postgres",
  process.env.DBUSERNAME,
  process.env.DBPASSWORD,
  {
    host: process.env.DBHOST,
    dialect: process.env.DBDIALECT || "postgres",
  }
);
const sqlcommenterMiddleware = wrapSequelizeAsMiddleware(
  sequelize,
  {
    traceparent: true,
    tracestate: true,

    // These are optional and will cause a high cardinality burst traced queries
    client_timezone: false,
    db_driver: false,
    route: false,
  },
  { TraceProvider: "OpenTelemetry" }
);

const Todo = sequelize.define(
  "Todo",
  {
    // Model attributes are defined here
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
    },
    done: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {}
);

async function createSomeTodos() {
  await sequelize.sync();

  const boringTasks = [];
  for (let i = 0; i < 1000; ++i) {
    boringTasks.push({
      title: `Boring task ${i}`,
      description: "A mundane task",
      done: true,
    });
  }

  await Todo.bulkCreate([
    { title: "Do dishes" },
    { title: "Buy groceries" },
    {
      title: "Do laundry",
      description: "Finish before Thursday!",
    },
    { title: "Clean room" },
    { title: "Wash car" },
    ...boringTasks,
  ]);
}

module.exports = {
  createSomeTodos,
  sequelize,
  sqlcommenterMiddleware,
  Todo,
};
