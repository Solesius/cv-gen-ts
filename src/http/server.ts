import { CoverLetterRequest } from "../models/cover-letter-request.model.ts";
import { Route } from "../models/http/route.ts";
import { ReplicateClient } from "../replicate/replicate-client.ts";

interface HttpServerOptions {
    port: number;
    host?: string;
}

const routes: Route[] = [
    {
        method: "POST",
        path: "/query",
        handler: async (r: Request) => {
            const query = await r.json() as CoverLetterRequest

            const s = await new ReplicateClient().generateCoverLetter(query)
            return new Response(s.response)
        },
    },
];

export function run(dev: boolean = false) {
    Deno.serve({ port: 3007 }, async (r: Request) => {
        const urlPath = new URL(r.url).pathname;

        const route = routes.find(
            (route) => route.method === r.method && route.path === urlPath
        );

        if (route) {
            try {
                const response = await route.handler(r);
                return response;
            } catch (error) {
                console.error("Error handling request:", error);
                return new Response("Internal Server Error", { status: 500 });
            }
        }

        return new Response("Not Found", { status: 404 });
    });
}
