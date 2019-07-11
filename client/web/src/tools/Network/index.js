export const handleError = (state, message) => {
  state.setState(
    {
      error: message ? message : 'Server Error.',
      success: null,
    },
    () => {
      setTimeout(() => {
        state.setState({ error: null });
      }, 4000);
    },
  );
};

export const handleSuccess = (state, message) => {
  state.setState(
    {
      success: message ? message : 'Success',
      error: null,
    },
    () => {
      setTimeout(() => {
        state.setState({ success: null });
      }, 4000);
    },
  );
};

export const bufferStringDecoder = buffer => {
  const decoder = new TextDecoder('utf-8');
  return decoder.decode(new Uint8Array(buffer.data));
};
