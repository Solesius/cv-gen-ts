export interface ApiResponse {}
export interface StringResponse extends ApiResponse {
    data : string
}
export interface BufferResponse extends ApiResponse {
    data : ArrayBuffer
}

