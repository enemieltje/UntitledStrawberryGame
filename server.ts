import
{
	Server,
	serve,
	ServerRequest,
	setCookie,
	Cookie,
} from "./deps.ts";

export default class HttpServer
{
	private server?: Server;
	private clientFiles = new Map<string, string>();

	constructor ()
	{
		this.addClientFile("index.html");
		this.addClientFile("pixi.js");
	}

	private addClientFile (fileName: string)
	{
		const path = "./client";
		const file = Deno.readTextFileSync(`${path}/${fileName}`);
		this.clientFiles.set(fileName, file);
	}

	async start (port = 8080)
	{

		this.server = serve(`:${port}`);
		console.log("running server...");


		for await (const req of this.server)
		{
			console.group(`Request: ${req.method} ${req.url}`);

			this.httpRequest(req);

			console.groupEnd();
		}
	}

	private httpRequest (req: ServerRequest)
	{
		// console.debug(req.headers);
		switch (req.method)
		{
			case ("GET"):
				this.httpGet(req);
				break;
			case ("POST"):
				this.httpPost(req);
				break;
			default:
				req.respond({status: 418, body: "invalid request"});
		}
	}

	private httpGet (req: ServerRequest)
	{
		switch (req.url)
		{
			case ("/pixi.js"):
				this.respond(req, 200, "pixi.js");
				console.debug("responded with pixi js");
				break;
			default:
				this.respond(req, 200, "index.html");
				console.debug("responded with index html");
		}
	}

	private httpPost (req: ServerRequest)
	{
		switch (req.url)
		{
			case ("/login"):
			default:
				this.respond(req, 418, "index.html");
				console.debug("unclear post request");
		}
	}

	private respond (req: ServerRequest, status: number, file: string, cookieSet?: Set<Cookie>)
	{

		if (this.clientFiles.get(file))
			file = this.clientFiles.get(file) as string;

		const response: Response = new Response();
		if (cookieSet)
		{
			cookieSet.forEach((cookie) =>
			{
				setCookie(response, cookie);
			});
		}

		req.respond({status: status, headers: response.headers, body: file});
	}

}
