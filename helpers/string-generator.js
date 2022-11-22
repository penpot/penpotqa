const random = () => {
  return Math.random().toString(36).substring(2, 7);
};

export { random };
