export interface Route{
    method : "GET" | "PUT" | "POST" | "PATCH" | "DELETE"
    path: string,
    handler : (r: Request) => Promise<Response>
}