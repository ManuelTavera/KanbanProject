import { describe, expect, it } from 'vitest'
import {
  BoardDetailSchema,
  BoardInputSchema,
  BoardSchema,
  BoardSummarySchema,
  ColumnSchema,
  LIMITS,
  StorageDocumentSchema,
  SubtaskSchema,
  TaskInputSchema,
  TaskSchema,
} from './schemas'
import type { Board, Column, Subtask, Task } from './schemas'
import type { ZodType } from 'zod'

const id = () => crypto.randomUUID()
const now = () => new Date().toISOString()

function makeBoard(overrides: Partial<Board> = {}): Board {
  return {
    id: id(),
    name: 'Platform Launch',
    rank: 'a0',
    createdAt: now(),
    updatedAt: now(),
    ...overrides,
  }
}

function makeColumn(overrides: Partial<Column> = {}): Column {
  return {
    id: id(),
    boardId: id(),
    name: 'Todo',
    rank: 'a0',
    color: '#49C4E5',
    ...overrides,
  }
}

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: id(),
    columnId: id(),
    title: 'Build UI for onboarding flow',
    description: '',
    rank: 'a0',
    createdAt: now(),
    updatedAt: now(),
    ...overrides,
  }
}

function makeSubtask(overrides: Partial<Subtask> = {}): Subtask {
  return {
    id: id(),
    taskId: id(),
    title: 'Sign up page',
    isCompleted: false,
    rank: 'a0',
    ...overrides,
  }
}

/** Issues as `{ path, message }`, with the path joined by dots. */
function issuesOf(schema: ZodType, value: unknown) {
  const result = schema.safeParse(value)
  if (result.success) return []
  return result.error.issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
  }))
}

const textFields = [
  {
    label: 'board name',
    schema: BoardSchema,
    field: 'name',
    limit: LIMITS.BOARD_NAME,
    make: (value: string) => makeBoard({ name: value }),
  },
  {
    label: 'column name',
    schema: ColumnSchema,
    field: 'name',
    limit: LIMITS.COLUMN_NAME,
    make: (value: string) => makeColumn({ name: value }),
  },
  {
    label: 'task title',
    schema: TaskSchema,
    field: 'title',
    limit: LIMITS.TASK_TITLE,
    make: (value: string) => makeTask({ title: value }),
  },
  {
    label: 'subtask title',
    schema: SubtaskSchema,
    field: 'title',
    limit: LIMITS.SUBTASK_TITLE,
    make: (value: string) => makeSubtask({ title: value }),
  },
]

describe('entity schemas', () => {
  it('accept valid entities', () => {
    expect(issuesOf(BoardSchema, makeBoard())).toEqual([])
    expect(issuesOf(ColumnSchema, makeColumn())).toEqual([])
    expect(issuesOf(TaskSchema, makeTask())).toEqual([])
    expect(issuesOf(SubtaskSchema, makeSubtask())).toEqual([])
  })

  for (const { label, schema, field, limit, make } of textFields) {
    describe(label, () => {
      it('rejects a whitespace-only value with "Can\'t be empty"', () => {
        expect(issuesOf(schema, make('   '))).toEqual([
          { path: field, message: "Can't be empty" },
        ])
      })

      it('trims surrounding whitespace', () => {
        const parsed = schema.parse(make('  Roadmap  ')) as Record<
          string,
          unknown
        >
        expect(parsed[field]).toBe('Roadmap')
      })

      it(`accepts exactly ${limit} characters`, () => {
        expect(issuesOf(schema, make('x'.repeat(limit)))).toEqual([])
      })

      it(`rejects ${limit + 1} characters`, () => {
        expect(issuesOf(schema, make('x'.repeat(limit + 1)))).toEqual([
          { path: field, message: `Max ${limit} characters` },
        ])
      })
    })
  }

  it('allows an empty task description but caps its length', () => {
    expect(issuesOf(TaskSchema, makeTask({ description: '' }))).toEqual([])
    expect(
      issuesOf(
        TaskSchema,
        makeTask({ description: 'x'.repeat(LIMITS.TASK_DESCRIPTION + 1) }),
      ),
    ).toEqual([
      {
        path: 'description',
        message: `Max ${LIMITS.TASK_DESCRIPTION} characters`,
      },
    ])
  })

  it('requires the column color to be a 6-digit hex code', () => {
    expect(issuesOf(ColumnSchema, makeColumn({ color: '#8471F2' }))).toEqual([])
    for (const color of ['banana', '#FFF', '49C4E5', '#49C4E5FF']) {
      expect(
        issuesOf(ColumnSchema, makeColumn({ color })).map(
          (issue) => issue.path,
        ),
      ).toEqual(['color'])
    }
  })

  it('rejects ids that are not UUIDs', () => {
    expect(
      issuesOf(BoardSchema, makeBoard({ id: 'board-1' })).map((i) => i.path),
    ).toEqual(['id'])
    expect(
      issuesOf(ColumnSchema, makeColumn({ boardId: '1' })).map((i) => i.path),
    ).toEqual(['boardId'])
  })

  it('rejects timestamps that are not ISO date-times', () => {
    expect(
      issuesOf(BoardSchema, makeBoard({ createdAt: 'yesterday' })).map(
        (i) => i.path,
      ),
    ).toEqual(['createdAt'])
  })

  it('rejects an empty rank', () => {
    expect(
      issuesOf(TaskSchema, makeTask({ rank: '' })).map((i) => i.path),
    ).toEqual(['rank'])
  })
})

describe('BoardInputSchema', () => {
  it('accepts a board with no columns (the empty-board state)', () => {
    expect(
      issuesOf(BoardInputSchema, { name: 'Roadmap', columns: [] }),
    ).toEqual([])
  })

  it('accepts existing columns (with id) and new ones (without)', () => {
    expect(
      issuesOf(BoardInputSchema, {
        name: 'Roadmap',
        columns: [{ id: id(), name: 'Todo' }, { name: 'Doing' }],
      }),
    ).toEqual([])
  })

  it('rejects a column id that is not a UUID', () => {
    expect(
      issuesOf(BoardInputSchema, {
        name: 'Roadmap',
        columns: [{ id: 'todo', name: 'Todo' }],
      }).map((i) => i.path),
    ).toEqual(['columns.0.id'])
  })

  it('reports an empty column name on that row', () => {
    expect(
      issuesOf(BoardInputSchema, {
        name: 'Roadmap',
        columns: [{ name: 'Todo' }, { name: '  ' }],
      }),
    ).toEqual([{ path: 'columns.1.name', message: "Can't be empty" }])
  })

  it('flags duplicate column names, ignoring case and spacing, on the later row', () => {
    expect(
      issuesOf(BoardInputSchema, {
        name: 'Roadmap',
        columns: [{ name: 'Todo' }, { name: 'Doing' }, { name: '  todo ' }],
      }),
    ).toEqual([{ path: 'columns.2.name', message: 'Already used' }])
  })

  it('flags every repeat after the first occurrence', () => {
    expect(
      issuesOf(BoardInputSchema, {
        name: 'Roadmap',
        columns: [{ name: 'Done' }, { name: 'DONE' }, { name: 'done' }],
      }),
    ).toEqual([
      { path: 'columns.1.name', message: 'Already used' },
      { path: 'columns.2.name', message: 'Already used' },
    ])
  })
})

describe('TaskInputSchema', () => {
  const valid = () => ({
    title: 'Build UI for search',
    description: '',
    columnId: id(),
    subtasks: [{ id: id(), title: 'Search page' }, { title: 'Results' }],
  })

  it('accepts existing subtasks (with id) and new ones (without)', () => {
    expect(issuesOf(TaskInputSchema, valid())).toEqual([])
  })

  it('accepts a task with no subtasks', () => {
    expect(issuesOf(TaskInputSchema, { ...valid(), subtasks: [] })).toEqual([])
  })

  it('reports an empty subtask title on that row', () => {
    expect(
      issuesOf(TaskInputSchema, {
        ...valid(),
        subtasks: [{ title: 'Search page' }, { title: ' ' }],
      }),
    ).toEqual([{ path: 'subtasks.1.title', message: "Can't be empty" }])
  })

  it('requires a valid column id (the status)', () => {
    expect(
      issuesOf(TaskInputSchema, { ...valid(), columnId: 'todo' }).map(
        (i) => i.path,
      ),
    ).toEqual(['columnId'])
  })
})

describe('StorageDocumentSchema', () => {
  const validDocument = () => {
    const board = makeBoard()
    const column = makeColumn({ boardId: board.id })
    const task = makeTask({ columnId: column.id })
    const subtask = makeSubtask({ taskId: task.id })
    return {
      schemaVersion: 1,
      boards: [board],
      columns: [column],
      tasks: [task],
      subtasks: [subtask],
    }
  }

  it('accepts a valid document', () => {
    expect(issuesOf(StorageDocumentSchema, validDocument())).toEqual([])
  })

  it('rejects any other schema version', () => {
    expect(
      issuesOf(StorageDocumentSchema, {
        ...validDocument(),
        schemaVersion: 2,
      }).map((i) => i.path),
    ).toEqual(['schemaVersion'])
  })

  it('rejects a document missing one of its collections', () => {
    const withoutSubtasks: Record<string, unknown> = validDocument()
    delete withoutSubtasks.subtasks
    expect(
      issuesOf(StorageDocumentSchema, withoutSubtasks).map((i) => i.path),
    ).toEqual(['subtasks'])
  })

  it('reports an invalid nested entity with its full path', () => {
    const document = validDocument()
    document.tasks[0] = makeTask({ title: '' })
    expect(issuesOf(StorageDocumentSchema, document)).toEqual([
      { path: 'tasks.0.title', message: "Can't be empty" },
    ])
  })
})

describe('read shapes', () => {
  it('BoardSummary keeps only id, name and rank', () => {
    const board = makeBoard()
    expect(BoardSummarySchema.parse(board)).toEqual({
      id: board.id,
      name: board.name,
      rank: board.rank,
    })
  })

  it('BoardDetail accepts a board with its columns, tasks and subtasks', () => {
    const board = makeBoard()
    expect(
      issuesOf(BoardDetailSchema, {
        board,
        columns: [makeColumn({ boardId: board.id })],
        tasks: [makeTask()],
        subtasks: [makeSubtask()],
      }),
    ).toEqual([])
  })
})
