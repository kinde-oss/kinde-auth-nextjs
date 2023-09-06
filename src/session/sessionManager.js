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
    cookieStore.delete('id_token_payload');
    cookieStore.delete('id_token');
    cookieStore.delete('access_token_payload');
    cookieStore.delete('access_token');
    cookieStore.delete('user');
    cookieStore.delete('refresh_token');
  }
});
