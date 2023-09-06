export const sessionManager = (cookieStore) => ({
  getSessionItem: (itemKey) => {
    const itemValue = cookieStore.get(itemKey).value;
    try {
      const jsonValue = JSON.parse(itemValue);
      if (typeof jsonValue === 'object') {
        return jsonValue;
      }
      return itemValue;
    } catch (error) {
      return itemValue;
    }
  },
  setSessionItem: (itemKey, itemValue) =>
    cookieStore.set(
      itemKey,
      typeof itemValue === 'object' ? JSON.stringify(itemValue) : itemValue
    ),
  removeSessionItem: (itemKey) => cookieStore.delete(itemKey),
  destroySession: () => {
    [
      'id_token_payload',
      'id_token',
      'access_token_payload',
      'access_token',
      'user',
      'refresh_token'
    ].forEach((name) => cookieStore.delete(name));
  }
});
