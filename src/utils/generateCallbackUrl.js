const generateCallbackUrl = (base, path) => {
  const siteUrl = base.endsWith("/") ? base.slice(0, -1) : base;
  const callbackPath = path.startsWith("/") ? path.substr(1) : path;
  return `${siteUrl}/${callbackPath}`;
};

export { generateCallbackUrl };
