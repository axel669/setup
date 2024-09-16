#!/usr/bin/env node

import fs from "fs-jetpack"
import http from "@axel669/http"

const github = http.create("https://api.github.com/repos")

const [dest, repo, tag] = process.argv.slice(2)

const main = async () => {
    if (dest === undefined) {
        console.log("No destination folder specified")
        return
    }
    if (repo === undefined) {
        console.log("No repo specified")
        return
    }
    if (tag === undefined) {
        const tags = await github.get(`${repo}/tags`)
        if (tags.ok === false) {
            console.log(`Unable to find tags for repo: ${repo}`)
            return
        }
        console.log("Please provide a valid tag to pull from\nMost recent tags:")
        for (const ref of tags.data.slice(0, 10)) {
            console.log(ref.name)
        }
        return
    }

    const tagInfo = await github.get(`${repo}/git/refs/tags/${tag}`)
    if (tagInfo.ok === false) {
        console.log(`Unable to load tag ${tag} from repo ${repo}`)
        return
    }

    const sha = tagInfo.data.object.sha
    const topLevel = await github.get(`${repo}/git/trees/${sha}`)
    if (topLevel.ok === false) {
        console.log(`Unable to load tree for repo`)
        return
    }

    const setupSHA = topLevel.data.tree.find(
        item => item.path === "setup"
    )
    if (setupSHA === undefined) {
        console.log("Repo does not have a setup folder to pull from")
        return
    }

    console.log(setupSHA.sha)
    const fileList = await github.get({
        url: `${repo}/git/trees/${setupSHA.sha}`,
        query: { recursive: "true" }
    })

    const files = fileList.data.tree.filter(
        file => file.type === "blob"
    )
    const destFolder = fs.cwd(dest)
    for (const file of files) {
        console.log("downloading:", file.path)
        const fileInfo = await github.get(`${repo}/git/blobs/${file.sha}`)
        const content = Buffer.from(fileInfo.data.content, fileInfo.data.encoding)
        destFolder.write(file.path, content)
    }
}

await main()
