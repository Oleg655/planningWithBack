import 'reflect-metadata';
import { Response, Router } from 'express';
import { injectable } from 'inversify';
import { ExpressReturnType, IControllerRoute } from './route.interface';

@injectable()
export abstract class BaseController {
	private readonly _router: Router;
	get router(): Router {
		return this._router;
	}

	constructor() {
		this._router = Router();
	}

	public send<T>(res: Response, code: number, message: T): ExpressReturnType {
		res.type('application/json');
		return res.status(code).json(message);
	}

	public ok<T>(res: Response, message: T): ExpressReturnType {
		return this.send<T>(res, 200, message);
	}

	protected bindRoute(routes: IControllerRoute[]): void {
		for (const route of routes) {
			const middleware = route.middleware?.map(m => m.execute.bind(m));
			const handler = route.func.bind(this);
			const pipeline = middleware ? [...middleware, handler] : handler;
			this.router[route.method](route.path, pipeline);
		}
	}
}
