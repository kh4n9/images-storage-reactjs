import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FileList from './FileList';
import { deleteFile } from '../services/api';

jest.mock('../services/api', () => ({
  deleteFile: jest.fn(() => Promise.resolve()),
}));

test('calls delete service and onDelete when delete button is clicked', async () => {
  const files = [{ id: 1, name: 'test.png' }];
  const handleDelete = jest.fn();
  render(<FileList files={files} onDelete={handleDelete} />);

  const button = screen.getByLabelText(/delete/i);
  fireEvent.click(button);

  await waitFor(() => {
    expect(deleteFile).toHaveBeenCalledWith(1);
    expect(handleDelete).toHaveBeenCalledWith(1);
  });
});

