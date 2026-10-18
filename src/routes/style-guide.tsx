import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

export const Route = createFileRoute('/style-guide')({
  component: RouteComponent,
})

// Class names are written out in full so Tailwind can detect them.
const colors = [
  { name: 'primary', hex: '#635FC7', className: 'bg-primary' },
  { name: 'primary-hover', hex: '#A8A4FF', className: 'bg-primary-hover' },
  { name: 'black', hex: '#000112', className: 'bg-black' },
  { name: 'very-dark-grey', hex: '#20212C', className: 'bg-very-dark-grey' },
  { name: 'dark-grey', hex: '#2B2C37', className: 'bg-dark-grey' },
  { name: 'lines-dark', hex: '#3E3F4E', className: 'bg-lines-dark' },
  { name: 'medium-grey', hex: '#828FA3', className: 'bg-medium-grey' },
  { name: 'lines-light', hex: '#E4EBFA', className: 'bg-lines-light' },
  { name: 'light-grey', hex: '#F4F7FD', className: 'bg-light-grey' },
  { name: 'red', hex: '#EA5555', className: 'bg-red' },
  { name: 'red-hover', hex: '#FF9898', className: 'bg-red-hover' },
  { name: 'white', hex: '#FFFFFF', className: 'bg-white' },
]

const semanticColors = [
  { name: 'background', className: 'bg-background' },
  { name: 'foreground', className: 'bg-foreground' },
  { name: 'surface', className: 'bg-surface' },
  { name: 'line', className: 'bg-line' },
]

const textStyles = [
  {
    name: 'Heading (XL)',
    spec: '24px / 30px, Bold',
    className: 'text-heading-xl',
  },
  {
    name: 'Heading (L)',
    spec: '18px / 23px, Bold',
    className: 'text-heading-l',
  },
  {
    name: 'Heading (M)',
    spec: '15px / 19px, Bold',
    className: 'text-heading-m',
  },
  {
    name: 'Heading (S)',
    spec: '12px / 15px, Bold, 2.4px tracking',
    className: 'text-heading-s uppercase',
  },
  { name: 'Body (L)', spec: '13px / 23px, Medium', className: 'text-body-l' },
  { name: 'Body (M)', spec: '12px / 15px, Bold', className: 'text-body-m' },
]

function RouteComponent() {
  const [isDark, setIsDark] = useState(false)

  // Sync with the actual <html> class after hydration.
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'))
  }, [])

  function toggleDark() {
    setIsDark(document.documentElement.classList.toggle('dark'))
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-12 p-8">
      <header className="flex items-center justify-between">
        <h1 className="text-heading-xl">Style Guide</h1>
        <button
          type="button"
          onClick={toggleDark}
          className="text-heading-m rounded-full bg-primary px-6 py-3 text-white transition-colors hover:bg-primary-hover"
        >
          {isDark ? 'Switch to light' : 'Switch to dark'}
        </button>
      </header>

      <section className="flex flex-col gap-6">
        <h2 className="text-heading-s uppercase text-medium-grey">Colors</h2>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {colors.map((color) => (
            <div key={color.name} className="flex flex-col gap-2">
              <div
                className={`h-24 rounded-lg border border-line ${color.className}`}
              />
              <p className="text-heading-m">{color.name}</p>
              <p className="text-body-l text-medium-grey">{color.hex}</p>
            </div>
          ))}
        </div>

        <h3 className="text-heading-s uppercase text-medium-grey">
          Semantic (swap under .dark)
        </h3>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {semanticColors.map((color) => (
            <div key={color.name} className="flex flex-col gap-2">
              <div
                className={`h-24 rounded-lg border border-line ${color.className}`}
              />
              <p className="text-heading-m">{color.name}</p>
              <p className="text-body-l text-medium-grey">
                --color-{color.name}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-heading-s uppercase text-medium-grey">
          Typography
        </h2>
        <div className="flex flex-col gap-6 rounded-lg bg-surface p-6">
          {textStyles.map((style) => (
            <div
              key={style.name}
              className="flex flex-col gap-1 border-b border-line pb-6 last:border-b-0 last:pb-0"
            >
              <p className="text-body-m text-medium-grey">
                {style.name} — {style.spec}
              </p>
              <p className={style.className}>
                The quick brown fox jumps over the lazy dog
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
