import type * as z from 'zod'

export type ErrorCode = 'NOT_FOUND' | 'VALIDATION' | 'CONFLICT'

/**
 * One problem with an input: where it is and what is wrong.
 * `path` uses the form's field path, e.g. `['columns', 1, 'name']`.
 * Every KanbanError exposes its problems in this shape, so the UI only has to
 * handle one contract, whatever the cause.
 */
export interface Issue {
  readonly path: ReadonlyArray<string | number>
  readonly message: string
}

export class KanbanError extends Error {
  readonly code: ErrorCode
  readonly issues: ReadonlyArray<Issue>

  constructor(
    code: ErrorCode,
    message: string,
    issues: ReadonlyArray<Issue> = [],
    options?: ErrorOptions,
  ) {
    super(message, options)
    this.name = new.target.name
    this.code = code
    this.issues = issues
  }
}

export class NotFoundError extends KanbanError {
  constructor(
    readonly entity: 'board' | 'column' | 'task' | 'subtask',
    readonly id: string,
  ) {
    super('NOT_FOUND', `${entity} ${id} not found`)
  }
}

const formatIssue = (issue: Issue) =>
  issue.path.length > 0
    ? `${issue.path.join('.')}: ${issue.message}`
    : issue.message

const formatIssues = (issues: ReadonlyArray<Issue>) =>
  issues.map(formatIssue).join(', ')

/** Translate a Zod issue into the app's own Issue shape (Zod stays internal). */
const fromZodIssue = (issue: z.core.$ZodIssue): Issue => ({
  path: issue.path.map((part) =>
    typeof part === 'number' ? part : String(part),
  ),
  message: issue.message,
})

/** The input failed its schema. Build it from `safeParse(...).error.issues`. */
export class ValidationError extends KanbanError {
  constructor(zodIssues: ReadonlyArray<z.core.$ZodIssue>) {
    const issues = zodIssues.map(fromZodIssue)
    super('VALIDATION', `Validation failed: ${formatIssues(issues)}`, issues)
  }
}

/**
 * The input is valid on its own but clashes with existing data,
 * e.g. a board name that is already taken.
 */
export class ConflictError extends KanbanError {
  constructor(
    readonly field: string,
    message = 'Already used',
  ) {
    const issues = [{ path: [field], message }]
    super('CONFLICT', `Conflict: ${formatIssues(issues)}`, issues)
  }
}
