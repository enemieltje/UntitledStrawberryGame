import
{
	Server,
	serve,
	ServerRequest,
	setCookie,
	Cookie,
} from "../deps.ts";

export default class HttpServer
{
	private server?: Server;
	private clientFiles = new Map<string, string>();

	constructor ()
	{
		// this.addClientFile("images/strawberry.png");
		// this.addClientFile("index.html");
		// this.addClientFile("pixi.min.js");
		// this.addClientFile("game/sprites/strawberry.png");
		// this.addClientFile("strawberry.js");
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

		const path = "./src/client";
		let file: Uint8Array;
		const folders = req.url.split("/");
		const targetedFile = folders[folders.length - 1];
		const extentionDotCount = (targetedFile.match(/\./g) || []).length;
		const totalDotCount = (req.url.match(/\./g) || []).length;
		try
		{
			if (req.url.includes("./") || totalDotCount > extentionDotCount)
			{
				file = Deno.readFileSync(`${path}/index.html`);
				console.debug("malicious request, responded with index html");
			}
			else
			{
				file = Deno.readFileSync(`${path}/${req.url}`);
			}
		} catch (error)
		{
			file = Deno.readFileSync(`${path}/index.html`);
			console.debug("file not found, responded with index html");
		}
		req.respond({status: 200, headers: new Response().headers, body: file});

		// switch (req.url)
		// {
		// 	case ("images/strawberry.png"):
		// 		this.respond(req, 200, "images/strawberry.png");
		// 		console.debug("responded with strawberry png");
		// 		break;
		// 	case ("game/sprites/strawberry.png"):
		// 		this.respond(req, 200, "game/sprites/strawberry.png");
		// 		console.debug("responded with strawberry png");
		// 		break;
		// 	case ("/pixi.min.js"):
		// 		this.respond(req, 200, "pixi.min.js");
		// 		console.debug("responded with pixi js");
		// 		break;
		// 	// case ("/pixi.min.js.map"):
		// 	// 	this.respond(req, 200, "pixi.min.js.map");
		// 	// 	console.debug("responded with pixi js map");
		// 	// 	break;
		// 	case ("/strawberry.js"):
		// 		this.respond(req, 200, "strawberry.js");
		// 		console.debug("responded with strawberry js");
		// 		break;
		// 	default:
		// 		this.respond(req, 200, "index.html");
		// 		console.debug("responded with index html");
		// }
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
