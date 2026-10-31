import * as z from 'zod'

export const LIMITS = {
  BOARD_NAME: 50,
  COLUMN_NAME: 30,
  TASK_TITLE: 100,
  SUBTASK_TITLE: 100,
  TASK_DESCRIPTION: 1000,
} as const

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/

const text = (max: number) =>
  z
    .string()
    .trim()
    .max(max, { error: `Max ${max} characters` })

const requiredText = (max: number) =>
  text(max).min(1, { error: "Can't be empty" })

const rank = z.string().min(1)
const timestamp = z.iso.datetime()

export const BoardSchema = z.object({
  id: z.uuid(),
  name: requiredText(LIMITS.BOARD_NAME),
  createdAt: timestamp,
  updatedAt: timestamp,
  rank,
})

export type Board = z.infer<typeof BoardSchema>

export const ColumnSchema = z.object({
  id: z.uuid(),
  boardId: z.uuid(),
  name: requiredText(LIMITS.COLUMN_NAME),
  rank,
  color: z.string().regex(HEX_COLOR, {
    error:
      'Invalid color format. Must be a 7-character hex code (e.g., #RRGGBB).',
  }),
})

export type Column = z.infer<typeof ColumnSchema>

export const TaskSchema = z.object({
  id: z.uuid(),
  columnId: z.uuid(),
  title: requiredText(LIMITS.TASK_TITLE),
  description: text(LIMITS.TASK_DESCRIPTION),
  rank,
  createdAt: timestamp,
  updatedAt: timestamp,
})

export type Task = z.infer<typeof TaskSchema>

export const SubtaskSchema = z.object({
  id: z.uuid(),
  taskId: z.uuid(),
  title: requiredText(LIMITS.SUBTASK_TITLE),
  isCompleted: z.boolean(),
  rank,
})

export type Subtask = z.infer<typeof SubtaskSchema>

export const BoardInputSchema = z
  .object({
    name: BoardSchema.shape.name,
    columns: z.array(
      z.object({
        id: z.uuid().optional(),
        name: ColumnSchema.shape.name,
      }),
    ),
  })
  .superRefine((input, ctx) => {
    const seen = new Set<string>()

    input.columns.forEach((column, index) => {
      const key = column.name.toLowerCase()
      if (seen.has(key)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Already used',
          path: ['columns', index, 'name'],
        })
      }

      seen.add(key)
    })
  })

export type BoardInput = z.infer<typeof BoardInputSchema>

export const TaskInputSchema = TaskSchema.pick({
  title: true,
  description: true,
  columnId: true,
}).extend({
  subtasks: z.array(
    z.object({
      id: z.uuid().optional(),
      title: SubtaskSchema.shape.title,
    }),
  ),
})

export type TaskInput = z.infer<typeof TaskInputSchema>

export const StorageDocumentSchema = z.object({
  schemaVersion: z.literal(1),
  boards: z.array(BoardSchema),
  columns: z.array(ColumnSchema),
  tasks: z.array(TaskSchema),
  subtasks: z.array(SubtaskSchema),
})

export type StorageDocument = z.infer<typeof StorageDocumentSchema>

export const BoardSummarySchema = BoardSchema.pick({
  id: true,
  name: true,
  rank: true,
})

export type BoardSummary = z.infer<typeof BoardSummarySchema>

export const BoardDetailSchema = z.object({
  board: BoardSchema,
  columns: z.array(ColumnSchema),
  tasks: z.array(TaskSchema),
  subtasks: z.array(SubtaskSchema),
})

export type BoardDetail = z.infer<typeof BoardDetailSchema>
