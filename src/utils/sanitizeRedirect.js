export const sanitizeRedirect = ({baseUrl, url}) => {
  if (url.startsWith('/')) {
    return `${baseUrl}${url}`;
  } else if (new URL(url).origin === baseUrl) {
    return url;
  }

  return baseUrl;
};
