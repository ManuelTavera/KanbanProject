import { describe, expect, it } from 'vitest'
import {
  ConflictError,
  KanbanError,
  NotFoundError,
  ValidationError,
} from './error'
import { BoardInputSchema } from './schemas'

/** Real Zod issues from a failed parse, so the test follows the schema. */
function zodIssuesFor(input: unknown) {
  const result = BoardInputSchema.safeParse(input)
  if (result.success) throw new Error('expected the input to be invalid')
  return result.error.issues
}

describe('NotFoundError', () => {
  const error = new NotFoundError('board', 'abc')

  it('is an Error, a KanbanError and a NotFoundError', () => {
    expect(error instanceof Error).toBe(true)
    expect(error instanceof KanbanError).toBe(true)
    expect(error instanceof NotFoundError).toBe(true)
  })

  it('has its code, name and context', () => {
    expect(error.code).toBe('NOT_FOUND')
    expect(error.name).toBe('NotFoundError')
    expect(error.entity).toBe('board')
    expect(error.id).toBe('abc')
    expect(error.message).toBe('board abc not found')
    expect(error.issues).toEqual([])
  })
})

describe('ValidationError', () => {
  const error = new ValidationError(
    zodIssuesFor({
      name: ' ',
      columns: [{ name: 'Todo' }, { name: 'todo' }],
    }),
  )

  it('is an Error, a KanbanError and a ValidationError', () => {
    expect(error instanceof Error).toBe(true)
    expect(error instanceof KanbanError).toBe(true)
    expect(error instanceof ValidationError).toBe(true)
  })

  it('has its code and name', () => {
    expect(error.code).toBe('VALIDATION')
    expect(error.name).toBe('ValidationError')
  })

  it('translates Zod issues into the app Issue shape (path + message only)', () => {
    expect(error.issues).toEqual([
      { path: ['name'], message: "Can't be empty" },
      { path: ['columns', 1, 'name'], message: 'Already used' },
    ])
  })

  it('summarises every issue in its message', () => {
    expect(error.message).toBe(
      "Validation failed: name: Can't be empty, columns.1.name: Already used",
    )
  })
})

describe('ConflictError', () => {
  const error = new ConflictError('name')

  it('is an Error, a KanbanError and a ConflictError', () => {
    expect(error instanceof Error).toBe(true)
    expect(error instanceof KanbanError).toBe(true)
    expect(error instanceof ConflictError).toBe(true)
  })

  it('has its code, name and field', () => {
    expect(error.code).toBe('CONFLICT')
    expect(error.name).toBe('ConflictError')
    expect(error.field).toBe('name')
    expect(error.message).toBe('Conflict: name: Already used')
  })

  it('exposes one issue in the same shape as a validation issue', () => {
    expect(error.issues).toEqual([{ path: ['name'], message: 'Already used' }])
    expect(Object.keys(error.issues[0])).toEqual(
      Object.keys(new ValidationError(zodIssuesFor({ name: '' })).issues[0]),
    )
  })

  it('accepts a custom message', () => {
    expect(
      new ConflictError('name', 'A board with this name exists').issues,
    ).toEqual([{ path: ['name'], message: 'A board with this name exists' }])
  })
})
