const fs = require("node:fs")

const args = process.argv.slice(2)
const [dest = "."] = args

const loadZip = async () => {
    const response = await fetch("https://github.com/axel669/setup/archive/zephyr.zip")
    return await response.arrayBuffer()
}
const loadLib = async () => {
    const response = await fetch("https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js")
    const init = new Function(
        "exports",
        "module",
        await response.text()
    )
    const exports = {}
    const module = {}
    init(exports, module)
    return module.exports
}
const mkdir = (file) => {
    const dir = file.name
    console.log(`mkdir  ${dir}`)
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
const mkfile = async (file) => {
    console.log(`mkfile ${file.name}`)
    fs.writeFileSync(file.name, await file.async("uint8array"))
}
const main = async () => {
    const JSZip = await loadLib()
    const zip = new JSZip()
    await zip.loadAsync(loadZip())
    const files = zip.filter(name => name.startsWith("setup-zephyr/files"))
    for (const file of files) {
        const action = file.dir ? mkdir : mkfile
        file.name = file.name.replace("setup-zephyr/files", dest)
        await action(file)
    }
}

main()
