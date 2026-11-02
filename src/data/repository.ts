import type {
  BoardSummary,
  BoardDetail,
  Board,
  BoardInput,
  TaskInput,
  Task,
  Subtask,
  Column,
} from './schemas'

export type ColumnMove = {
  columnId: string
  beforeColumnId?: string
  afterColumnId?: string
}

export type TaskMove = {
  taskId: string
  toColumnId: string
  beforeTaskId?: string
  afterTaskId?: string
}

export interface KanbanRepository {
  listBoards: () => Promise<BoardSummary[]> // id, name, rank
  getBoard: (boardId: string) => Promise<BoardDetail> // board + columns + tasks + subtasks
  createBoard: (input: BoardInput) => Promise<Board> // name + column names
  updateBoard: (boardId: string, input: BoardInput) => Promise<Board> // rename, add/rename/remove columns
  deleteBoard: (boardId: string) => Promise<void> // cascades to columns, tasks, subtasks
  moveColumn: (move: ColumnMove) => Promise<Column>
  createTask: (input: TaskInput) => Promise<Task> // appended to the end of its column
  updateTask: (taskId: string, input: TaskInput) => Promise<Task>
  deleteTask: (taskId: string) => Promise<void> // cascades to subtasks
  moveTask: (move: TaskMove) => Promise<Task>
  setSubtaskCompleted: (
    subtaskId: string,
    isCompleted: boolean,
  ) => Promise<Subtask>
}
