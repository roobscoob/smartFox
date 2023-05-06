export class ConnectionFailureError extends Error {
  constructor(
    public readonly tlsError?: unknown,
    public readonly tcpError?: unknown,
    public readonly httpError?: unknown,
    public readonly httpsError?: unknown,
  ) {
    let stringBuilder = "No connection methods succeeded";

    if (tlsError)
      stringBuilder += `\n  TLS: ${tlsError}`;

    if (httpsError)
      stringBuilder += `\n  HTTPS: ${httpsError}`;

    if (tcpError)
      stringBuilder += `\n  TCP: ${tcpError}`;

    if (httpError)
      stringBuilder += `\n  HTTP: ${httpError}`;

    super(stringBuilder);
  }
}
