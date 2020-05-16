const gulp = require('gulp');
const path = require('path');

const tsBrowser = require('@hopin/wbt-ts-browser');
const css = require('@hopin/wbt-css');
const clean = require('@hopin/wbt-clean');
const html = require('@gauntface/html-asset-manager');
const fs = require('fs-extra');

const hugo = require('@gauntface/hugo-node');
const hopinstyleguide = require('@hopin/hugo-styleguide');
const basetheme = require('@hopin/hugo-base-theme');
const thistheme = require('./index');

/**
 * Build theme package
 */
const themeSrc = path.join(__dirname, 'src');
const themeDst = path.join(__dirname, 'build');
const copyExts = [
  'toml',
  'json',
  'html',
  'svg',
  'jpg',
  'jpeg',
  'gif',
  'png',
  'js',
  'woff',
  'woff2',
];


function setEnv(e) {
  const f = async () => {
    process.env.ENV = e
  }
  f.displayName = 'set-env'
  return f
}

gulp.task('clean', gulp.series(
  clean.gulpClean([
    themeDst,
  ]),
))

gulp.task('typescript', gulp.series(
  tsBrowser.gulpBuild('gauntface.webpushbook', {
    src: themeSrc,
    dst: themeDst,
  })
))

gulp.task('css', async () => {
  return css.build({
    src: themeSrc,
    dst: themeDst,
  }, {
    importPaths: [themeSrc],
    preserve: process.env.ENV == 'dev',
    cssVariablesDir: path.join(__dirname, 'src', 'static', 'css', 'variables'),
  });
})

gulp.task('copy', () => {
  const glob = path.join(themeSrc, `**/*.{${copyExts.join(',')}}`);
  return gulp.src(glob)
    .pipe(gulp.dest(themeDst));
})

gulp.task('perform-build', gulp.series(
  'clean',
  gulp.parallel(
    'typescript',
    'css',
    'copy',
  ),
))

gulp.task('build-dev', gulp.series(
  setEnv('dev'),
  'perform-build',
))

gulp.task('build', gulp.series(
  setEnv('prod'),
  'perform-build',
))

/**
 * Build styleguide site
 */

const styleguideDir = path.join(__dirname, 'styleguide');
const styleguidePublicDir = path.join(__dirname, 'styleguide', 'public');

gulp.task('styleguide-clean', gulp.series(
  clean.gulpClean([
    path.join(styleguideDir, 'public'),
    path.join(styleguideDir, 'themes'),
    path.join(styleguideDir, 'content'),
  ])
))

const thisThemeDir = path.join(styleguideDir, 'themes', 'web-push-book');
const sgThemeDir = path.join(styleguideDir, 'themes', 'hopin-styleguide');
const sgContentDir = path.join(styleguideDir, 'content');
const baThemeDir = path.join(styleguideDir, 'themes', 'hopin-base-theme');

function cleanAndRun(themeDir, cp) {
  const fn = async () => {
    await fs.remove(themeDir);
    await cp(themeDir);
  }
  fn.displayName = 'clean-and-run';
  return fn
}

gulp.task('styleguide-this-theme', cleanAndRun(thisThemeDir, thistheme.copyTheme))
gulp.task('styleguide-ba-theme', cleanAndRun(baThemeDir, basetheme.copyTheme))
gulp.task('styleguide-sg-theme', cleanAndRun(sgThemeDir, hopinstyleguide.copyTheme))
gulp.task('styleguide-sg-content', cleanAndRun(sgContentDir, hopinstyleguide.copyContent))

gulp.task('styleguide-themes', gulp.series(
  'styleguide-this-theme',
  'styleguide-ba-theme',
  'styleguide-sg-theme',
  'styleguide-sg-content',
));

gulp.task('styleguide-html', () => html.manageAssets({
  config: path.join(styleguidePublicDir, 'asset-manage.json'),
  output: true,
}));

gulp.task('styleguide-hugo', () => hugo.build(styleguideDir));

gulp.task('styleguide-build', gulp.series(
  'build',
  'styleguide-clean',
  'styleguide-themes',
  'styleguide-hugo',
  'styleguide-html',
))

const hugoServerFlags = ['-D', '--ignoreCache', '--port=1314'];
gulp.task('hugo-server', () => hugo.startServer(styleguideDir, hugoServerFlags));
gulp.task('hugo-server-restart', () => hugo.restartServer(styleguideDir, hugoServerFlags));


const watchTasks = [
  {task: 'css', ext: 'css'},
  {task: 'typescript', ext: 'ts'},
  {task: 'copy', ext: `{${copyExts.join(',')}}`},
];
const watchTaskNames = [];
for (const wt of watchTasks) {
  const taskName = `watch-theme-${wt.task}`;
  gulp.task(taskName, () => {
    const opts = {
      delay: 500,
    };
    return gulp.watch(
      [path.posix.join(themeSrc, '**', `*.${wt.ext}`)],
      opts,
      gulp.series(wt.task, 'styleguide-this-theme', 'hugo-server-restart'),
    );
  });
  watchTaskNames.push(taskName)
}

gulp.task('watch-theme', gulp.series(
  setEnv('dev'),
  'perform-build',
  'styleguide-themes',
  gulp.parallel(...watchTaskNames),
));

gulp.task('watch',
  gulp.parallel(
    'watch-theme',
    'hugo-server',
  ),
);