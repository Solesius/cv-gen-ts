import { Route } from "../models/http/route.ts";
import {
    ok,
    forbid,
    err,
    notFound,
} from "../http/combinators/http-combinators.ts";
import { ReplicateClient } from "../replicate/replicate-client.ts";
import { handleFilePath } from "./middleware/static-file-handler.ts";

interface HttpServerOptions {
    port: number;
    host?: string;
}

const routes: Route[] = [
    {
        method: "GET",
        path: "/cv-api/list-resume",
        handler: () => {
            //   const gemmaResponse = await new ReplicateClient().generateCoverLetter({
            //     resume: "Applications Architect",
            //     jobDescription: "need app architect",
            //   });
            //   console.dir(gemmaResponse);
            return Promise.resolve(ok(JSON.stringify([])));
        },
    },
];

export function run(dev: boolean = false) {
    Deno.serve({ port: 3007 }, async (r: Request) => {
        const urlPath = new URL(r.url).pathname;
        console.log(urlPath)

        const route = routes.find(
            (route) => route.method === r.method && route.path === urlPath
        );

        //calling the api
        if (urlPath.toUpperCase().includes("cv-api".toUpperCase()) && route) {
            try {
                const response = await route.handler(r);
                return response;
            } catch (error) {
                console.error("Error handling request:", error);
                return err();
            }
        } else if (!route) {
            if (urlPath.includes("cv-api")) {
                return err()
            } else {
                const fileByteResponse = await handleFilePath(urlPath);
                if (fileByteResponse !== null) {
                    return fileByteResponse;
                } else {
                    // if not found, redirect application back to index, so angular router can pickup on changes. 
                    const indexPath = await handleFilePath("/index.html")
                    return indexPath == null ? err() : indexPath
                }
            }
        }
        return notFound();
    });
}
