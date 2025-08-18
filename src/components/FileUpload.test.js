import React from 'react';
import { render, fireEvent, screen, act } from '@testing-library/react';
import FileUpload from './FileUpload';
import { filesAPI } from '../services/api';

jest.mock('../services/api', () => ({
  filesAPI: { uploadFile: jest.fn() },
}));

global.URL.createObjectURL = jest.fn(() => 'blob:url');

beforeEach(() => {
  jest.useFakeTimers();
  filesAPI.uploadFile.mockReset();
});

test('calls onUploadSuccess after successful file uploads', async () => {
  filesAPI.uploadFile.mockResolvedValue({ id: '1' });
  const onUploadSuccess = jest.fn();
  const onClose = jest.fn();

  render(
    <FileUpload
      open={true}
      onClose={onClose}
      onUploadSuccess={onUploadSuccess}
      currentFolder={null}
      userId="user1"
    />
  );
  const input = document.querySelector('input[type="file"]');
  const file = new File(['hello'], 'test.png', { type: 'image/png' });

  await act(async () => {
    fireEvent.change(input, { target: { files: [file] } });
  });

  const uploadButton = screen.getByRole('button', { name: /upload 1 files/i });

  await act(async () => {
    fireEvent.click(uploadButton);
  });

  // run timers to process the delayed close
  await act(async () => {
    jest.advanceTimersByTime(1000);
  });

  expect(onUploadSuccess).toHaveBeenCalled();
  expect(onClose).toHaveBeenCalled();
});
