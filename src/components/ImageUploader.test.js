import { render, screen } from '@testing-library/react';
import ImageUploader from './ImageUploader';

test('renders upload button', () => {
  render(<ImageUploader />);
  expect(screen.getByText(/upload/i)).toBeInTheDocument();
});
