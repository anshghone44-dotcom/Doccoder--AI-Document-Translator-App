import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import Header from '@/components/header'

describe('Header', () => {
  it('renders the header with title', () => {
    const { getByText } = render(<Header />)
    expect(getByText('Doccoder')).toBeInTheDocument()
  })
})