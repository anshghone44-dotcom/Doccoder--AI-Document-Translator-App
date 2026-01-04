import { render, screen } from '@testing-library/react'
import Header from '@/components/header'

describe('Header', () => {
  it('renders the header with title', () => {
    render(<Header />)
    expect(screen.getByText('Doccoder')).toBeInTheDocument()
  })
})