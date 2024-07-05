
import { } from "https://deno.land/std@0.188.0/fs/mod.ts";
import { err, file } from "../combinators/http-combinators.ts";

export const handleFilePath = async (filePath: string): Promise<(Response | null)> => {
    const mimeMap: Map<string, string> = new Map([
        [".json", "application/json"],
        [".html", "text/html"],
        [".css", "text/css"],
        [".js", "application/javascript"]
    ])

    const dotIndex = filePath.indexOf('.')
    if (dotIndex == -1) {
        return null
    } else {
        const ext = filePath.slice(dotIndex)
        const mime = mimeMap.get(ext)
        if (mime) {
            try {
                const readFile = await Deno.readFile('webui/dist/webui/browser' + filePath)
                if (file.length > 0) {
                    return file(readFile,mime)
                } else {
                    return err()
                }
            } catch(error) {
                console.log(error)
                return err()
            }
        } else {
            return err()
        }
    }
}