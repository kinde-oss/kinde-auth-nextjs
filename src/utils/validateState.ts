export default function validateState(passedState: string) {
  if (!/^[a-zA-Z0-9-_]+$/.test(passedState)) {
    return false;
  }
  return true;
}
