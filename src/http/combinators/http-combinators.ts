type DataBuffer = string | ArrayBuffer
export const ok = (data?: DataBuffer) => new Response(data, { status: 200, headers: new Headers({ "Content-Type": "application/json" }) })
export const forbid = () => new Response(null, { status: 403 })
export const notFound = () => new Response(null, { status: 404 })
export const err = () => new Response("Internal Server Error", { status: 500 })
export const json = (data?: DataBuffer) => new Response(data, { status: 200, headers: new Headers({ "Content-Type": "application/json" }) })
export const file = (data: DataBuffer, mime: string) => new Response(data, { status: 200, headers: new Headers({ "Content-Type": mime }) })