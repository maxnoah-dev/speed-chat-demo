declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

declare module '*.scss' {
  const content: { [className: string]: string };
  export default content;
}

declare const process: {
  env: {
    REACT_APP_API_URL?: string;
  };
};
