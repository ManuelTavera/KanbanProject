import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

describe('test setup', () => {
  it('renders, queries by role and handles a click', async () => {
    const user = userEvent.setup()
    let clicks = 0
    render(
      <button type="button" onClick={() => (clicks += 1)}>
        Add New Task
      </button>,
    )

    const button = screen.getByRole('button', { name: 'Add New Task' })
    expect(button).toBeInTheDocument()

    await user.click(button)
    expect(clicks).toBe(1)
  })
})
