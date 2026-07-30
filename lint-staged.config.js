/** @type {import('lint-staged').Configuration} */
export default {
  '*.{js,ts,vue,mjs,cjs}': ['eslint --fix', 'prettier --write'],
  '*.{css,scss,json,md,yml,yaml}': ['prettier --write'],
}
