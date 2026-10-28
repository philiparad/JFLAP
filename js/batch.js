// Empty lines are intentional empty-word test cases, including a final blank line.
export function parseInputs(text){return String(text).replace(/^\uFEFF/,'').replace(/\r\n?/g,'\n').split('\n');}
