// https://github.com/substack/minimist
const args = require('minimist')(process.argv.slice(2))
const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const semver = require('semver')
const currentVersion = require('../package.json').version
const { prompt } = require('enquirer')
const execa = require('execa')

const preId = args.preid || semver.prerelease(currentVersion) ? semver.prerelease(currentVersion)[0] : 'latest' || 'latest'
// 只更新版本和生成CHANGELOG.md
const isDryRun = args.dry
// 是否跳过测试
const skipTests = args.skipTests
// https://docs.npmjs.com/cli/version
const versionIncrements = [
  'patch',
  'minor',
  'major',
  'prepatch',
  'preminor',
  'premajor',
  'prerelease'
]

const inc = i => semver.inc(currentVersion, i, preId)
const bin = name => path.resolve(__dirname, '../node_modules/.bin/' + name)
const run = (bin, args, opts = {}) =>
  execa(bin, args, { stdio: 'inherit', ...opts })
const dryRun = (bin, args, opts = {}) =>
  console.log(chalk.blue(`[dryrun] ${bin} ${args.join(' ')}`), opts)
const runIfNotDry = isDryRun ? dryRun : run
const step = msg => console.log(chalk.cyan(msg))

async function main() {
  let targetVersion = args._[0]

  if (!targetVersion) {
    // no explicit version, offer suggestions
    const { release } = await prompt({
      type: 'select',
      name: 'release',
      message: 'Select release type',
      choices: versionIncrements.map(i => `${i} (${inc(i)})`).concat(['custom'])
    })

    if (release === 'custom') {
      targetVersion = (await prompt({
        type: 'input',
        name: 'version',
        message: 'Input custom version',
        initial: currentVersion
      })).version
    } else {
      targetVersion = release.match(/\((.*)\)/)[1]
    }
  }

  if (!semver.valid(targetVersion)) {
    throw new Error(`invalid target version: ${targetVersion}`)
  }

  const { yes } = await prompt({
    type: 'confirm',
    name: 'yes',
    message: `Releasing v${targetVersion}. Confirm?`
  })

  if (!yes) {
    return
  }

  // run tests before release
  step('\nRunning tests...')
  if (!skipTests && !isDryRun) {
    await run(bin('jest'), ['--clearCache'])
    await run('npm', ['run', 'test'])
  } else {
    console.log(`(skipped)`)
  }

  // update package version
  step('\nUpdating package version...')
  updateVersions(targetVersion)

  // generate changelog
  await run(`npm`, ['run', 'changelog'])

  // git add all and commit 
  const { stdout } = await run('git', ['diff'], { stdio: 'pipe' })
  if (stdout) {
    step('\nCommitting changes...')
    await runIfNotDry('git', ['add', '-A'])
    await runIfNotDry('git', ['commit', '-m', `release: v${targetVersion}`])
  } else {
    console.log('No changes to commit.')
  }

  // publish packages
  step('\nPublishing packages...')
  await publishPackage(targetVersion, runIfNotDry)
  
  // push to GitHub
  step('\nPushing to GitHub...')
  await runIfNotDry('git', ['tag', `v${targetVersion}`])
  await runIfNotDry('git', ['push', 'origin', `refs/tags/v${targetVersion}`])
  await runIfNotDry('git', ['push'])

  if (isDryRun) {
    console.log(`\nDry run finished - run git diff to see package changes.`)
  }
}

function updateVersions(version) {
  // update root package.json
  updatePackage(path.resolve(__dirname, '..'), version)
}

function updatePackage(pkgRoot, version) {
  const pkgPath = path.resolve(pkgRoot, 'package.json')
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
  pkg.version = version
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
}

async function publishPackage(version, runIfNotDry) {
  const pkgRoot = path.resolve(__dirname, '..')
  const pkgPath = path.resolve(pkgRoot, 'package.json')
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
  const pkgName = pkg.name

  if (pkg.private) {
    return
  }

  // for now (alpha/beta phase), every package except "vue" can be published as
  // `latest`, whereas "vue" will be published under the "next" tag.

  // https://docs.npmjs.com/adding-dist-tags-to-packages
  const releaseTag = semver.prerelease(currentVersion) ? semver.prerelease(currentVersion)[0] : 'latest' || 'latest'
  
  step(`Publishing ${pkgName}...`)
  try {
    await runIfNotDry(
      'npm',
      [
        'version',
        version
      ],
      {
        cwd: pkgRoot,
        stdio: 'pipe'
      }
    )
    await runIfNotDry(
      'npm',
      [
        'publish',
        '--tag',
        releaseTag,
        '--access',
        'public'
      ],
      {
        cwd: pkgRoot,
        stdio: 'pipe'
      }
    )
    console.log(chalk.green(`Successfully published ${pkgName}@${version}`))
  } catch (e) {
    if (e.stderr.match(/previously published/)) {
      console.log(chalk.red(`Skipping already published: ${pkgName}`))
    } else {
      throw e
    }
  }
}

main().catch(err => {
  console.error(err)
})