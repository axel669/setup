const fs = require("node:fs")
const { promisify } = require('util');
const exec = promisify(require('child_process').exec)

const args = process.argv.slice(2)
const [dest = "."] = args
const hash = Date.now().toString(16)

const mkdir = (dir) => {
    try {
        fs.mkdirSync(dir)
    }
    catch (err) {
        if (err.code === "EEXIST") {
            return
        }
        throw err
    }
}

const fix = (name) => [name, name.replace("setup-zephyr/files", dest)]
const main = async () => {
    const githubResponse = await fetch("https://github.com/axel669/setup/archive/zephyr.zip")
    const content = await githubResponse.arrayBuffer()
    fs.writeFileSync(`${hash}.zip`, new Uint8Array(content))

    const res = await exec(`zipinfo -2 ${hash}.zip`)
    const lines =
        res.stdout.trim()
        .split("\n")
        .filter(file => file.startsWith("setup-zephyr/files"))
        .map(fix)
    const dirs = lines.filter(name => name[0].endsWith("/") === true)
    const files = lines.filter(name => name[0].endsWith("/") === false)

    for (const [zipDir, outDir] of dirs) {
        console.log("creating", outDir)
        mkdir(outDir)
    }
    for (const [zipFile, outFile] of files) {
        console.log(`unzipping ${outFile}`)
        await exec(`unzip -p -c ${hash}.zip "${zipFile}" > "${outFile}"`)
    }
    fs.rmSync(`${hash}.zip`)
}

main()
