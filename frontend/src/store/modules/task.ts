import axios from "axios";
import {
  ResourceIdentifier,
  ResourceObject,
  Task,
  TaskId,
  TaskState,
  TaskStatusPatch,
  Step,
  Issue,
  IssueId,
  unknown,
  PipelineId,
  Pipeline,
} from "../../types";

const state: () => TaskState = () => ({});

function convertPartial(
  task: ResourceObject,
  includedList: ResourceObject[],
  rootGetters: any
): Omit<Task, "pipeline"> {
  const creator = rootGetters["principal/principalById"](
    task.attributes.creatorId
  );
  const updater = rootGetters["principal/principalById"](
    task.attributes.updaterId
  );

  const database = rootGetters["database/databaseById"](
    (task.relationships!.database.data as ResourceIdentifier).id
  );

  const stepList: Step[] = [];
  for (const item of includedList || []) {
    if (
      item.type == "step" &&
      (item.relationships!.task.data as ResourceIdentifier).id == task.id
    ) {
      const step = rootGetters["step/convertPartial"](item);
      stepList.push(step);
    }
  }

  const result: Omit<Task, "pipeline"> = {
    ...(task.attributes as Omit<
      Task,
      "id" | "creator" | "updater" | "database" | "stepList"
    >),
    id: task.id,
    creator,
    updater,
    database,
    stepList,
  };

  return result;
}

const getters = {
  convertPartial: (
    state: TaskState,
    getters: any,
    rootState: any,
    rootGetters: any
  ) => (task: ResourceObject, includedList: ResourceObject[]): Task => {
    // It's only called when pipeline tries to convert itself, so we don't have a issue yet.
    const pipelineId = task.attributes.pipelineId as PipelineId;
    let pipeline: Pipeline = unknown("PIPELINE") as Pipeline;
    pipeline.id = pipelineId;

    const result: Task = {
      ...convertPartial(task, includedList, rootGetters),
      pipeline,
    };

    for (const step of result.stepList) {
      step.task = result;
      step.pipeline = pipeline;
    }

    return result;
  },

  async updateTaskStatus(
    { dispatch }: any,
    {
      issueId,
      taskId,
      taskStatusPatch,
    }: {
      issueId: IssueId;
      taskId: TaskId;
      taskStatusPatch: TaskStatusPatch;
    }
  ) {
    const data = (
      await axios.patch(`/api/issue/${issueId}/task/${taskId}/status`, {
        data: {
          type: "taskstatuspatch",
          attributes: taskStatusPatch,
        },
      })
    ).data;

    dispatch("issue/fetchIssueById", issueId, { root: true });
  },
};

const actions = {};

const mutations = {};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
