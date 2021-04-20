import { Store } from "vuex";
import {
  Environment,
  Principal,
  IssueNew,
  Issue,
  DatabaseId,
  UNKNOWN_ID,
  Database,
} from "../types";

// Issue
// It has to be string type because the id for task field contain multiple parts.
export type FieldId = string;

export enum IssueBuiltinFieldId {
  NAME = "1",
  STATUS = "2",
  ASSIGNEE = "3",
  DESCRIPTION = "4",
  PROJECT = "5",
  ENVIRONMENT = "6",
  INSTANCE = "7",
  DATABASE = "8",
  DATA_SOURCE = "9",
  TASK = "10", // The full id is concatenated with the actual task id e.g. "8".<<task id>>
  SQL = "11",
  ROLLBACK_SQL = "12",
  SUBSCRIBER_LIST = "13",
  TASK_STATUS = "14",
}

export const INPUT_CUSTOM_FIELD_ID_BEGIN = "100";
export const OUTPUT_CUSTOM_FIELD_ID_BEGIN = "200";

export type IssueFieldType =
  | "Boolean"
  | "String"
  | "Environment"
  | "Project"
  | "Database"
  | "NewDatabase";

export type IssueFieldReferenceProvider = {
  title: string;
  link: string;
};

export type IssueFieldReferenceProviderContext = {
  issue: Issue;
  field: IssueField;
};

export type IssueContext = {
  store: Store<any>;
  currentUser: Principal;
  new: boolean;
  issue: Issue | IssueNew;
};

export type IssueField = {
  category: "INPUT" | "OUTPUT";
  // Used as the key to store the data. This must NOT be changed after
  // in use, otherwise, it will cause data loss/corruption. Its design
  // is very similar to the message field id in Protocol Buffers.
  id: FieldId;
  // Used as the key to generate UI artifacts (e.g. query parameter).
  // Though changing it won't have catastrophic consequence like changing
  // id, we strongly recommend NOT to change it as well, otherwise, previous
  // generated artifacts based on this info such as URL would become invalid.
  // slug will be formmatted to lowercase and replace any space with "-",
  // e.g. "foo Bar" => "foo-bar"
  slug: string;
  // The display name. OK to change.
  name: string;
  // Field type. This must NOT be changed after in use. Similar to id field.
  type: IssueFieldType;
  // Whether the field is required.
  required: boolean;
  // Whether the field is resolved.
  // For INPUT, one use case is together with "required" field to validate whether it's ready to submit the data.
  // For OUTPUT, one use case is to validate whether the field is filled properly according to the issue.
  resolved: (ctx: IssueContext) => boolean;
  // Placeholder displayed on UI.
  placeholder?: string;
};

export const UNKNOWN_FIELD: IssueField = {
  category: "INPUT",
  id: UNKNOWN_ID,
  slug: "",
  name: "<<Unknown field>>",
  type: "String",
  required: false,
  resolved: () => false,
};

// Field payload for "Database" and "NewDatabase" field
export type DatabaseFieldPayload = {
  isNew: boolean;
  // If isNew is true, name stores the new database name, otherwise, is null.
  name?: string;
  // If isNew is false, id stores the database id, otherwise, is null.
  id?: DatabaseId;
  readOnly: boolean;
};

// Template
export type TemplateContext = {
  databaseList: Database[];
  currentUser: Principal;
};

export type IssueTemplate = {
  type: string;
  buildIssue: (
    ctx: TemplateContext
  ) => Omit<IssueNew, "projectId" | "creatorId">;
  fieldList: IssueField[];
};
