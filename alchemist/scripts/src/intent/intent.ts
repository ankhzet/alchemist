
import { Instance } from './concept/instance';
import { IntentType } from './concept/type';

export class IntentNumber extends IntentType<Number> {

	constructor() {
		super(Number);
		this.allow((instance) => {
			return !!(instance && instance.value instanceof Number);
		});
	}

	required() {
		let next = this._deny;
		return this.deny(next
				? (instance) => (!(instance && instance.value.valueOf())) || next(instance)
				: (instance) => (!(instance && instance.value.valueOf()))
		).strict();
	}

}

export class IntentArray<T> extends IntentType<Array<Instance<T>>> {
	element: IntentType<T>;

	constructor(element: IntentType<T>) {
		super(Array);
		this.element = element;

		this.allow((instance: Instance<Array<Instance<T>>>) => {
			if (!(instance && instance.value instanceof Array))
				return false;

			return instance.value.filter((e) => {
				return !this.element.validate(e);
			}).length === 0;
		});
	}

	required(): this {
		let next = this._deny;
		return this.deny(next
			? (instance) => (!(instance && instance.value.length)) || next(instance)
			: (instance) => (!(instance && instance.value.length))
		).strict();
	}

	toString() {
		return `${this.element.name}[]`;
	}
}

function typeOf(arg) {
	if (!arg)
		return 'undefined';

	if (arg instanceof Instance) {
		if (arg.resolver instanceof IntentType)
			return arg.resolver;
		else
			return `Immediate(${arg.value && arg.value.constructor.name})`;
	}

	return `Primitive(${arg.constructor.name})`;
}

function formatEvent(event, specification) {
	let parameters = [];
	if (specification.expects) {
		parameters = specification.expects.map((e) => {
			let name = Object.keys(e)[0];
			let type = e[name];
			return `${name}: ${type}`;
		});
	}
	return `${event}(${parameters.join(', ')})` + (specification.returns
		?	' => ' + specification.returns
		: ''
	);
}

function unpackExpectation(event, all, e) {
	let name = Object.keys(all.expects[e])[0];
	let type = all.expects[e][name];
	if (!type)
		throw new Error(`${formatEvent(event, all)}: Invalid constraint for argument "${name}"`);

	return [name, type];
}

export interface Constructor<T> {
	new (...args: any[]): T;
}

export const intent = {
	string: new IntentType(String),
	number: new IntentNumber(),
	boolean: new IntentType(Boolean),

	type(instantiator) {
		return new IntentType(instantiator);
	},
	array(instantiator) {
		return new IntentArray(instantiator);
	},
	event(event, target, specification) {
		let returns = specification.returns;

		let expects = [];
		let names = [];
		for (let i in specification.expects) {
			let [name, type] = unpackExpectation(event, specification, i);
			names.push(name);
			expects.push(type);
		}

		return function (...args: any[]) {
			// console.log(`${formatEvent(event, specification)}:`, ...args);

			if (expects) {
				for (let i in expects) {
					let type = expects[i];
					let arg  = args[i];
					if (arg && !(arg instanceof Instance))
						arg = Instance.wrap(arg);

					// console.log(`validate [${arg}] is [${type}]:`, type.validate(arg));
					if (!type.validate(arg)) {
						throw new Error(`${formatEvent(event, specification)}: Expected "${names[i]}" to be of type ${type}, ${typeOf(arg)} (${JSON.stringify(arg)}) passed.`);
					}
				}
			}

			let unwrap = (arg) => {
				if (arg instanceof Array)
					arg = arg.map(unwrap);
				if (arg instanceof Instance)
					arg = unwrap(arg.value);
				return arg;
			};

			let response = target.apply(this, unwrap(args));

			if (returns)
				if (!returns.validate(response))
					throw new Error(`[${event}]: Expected ${returns} to be returned, ${typeOf(response)} met.`);

			return response;
		};
	},
	describe<T>(host: Constructor<T>, meta): T {
		let className = host.name;
		let classConstructor = <{new(...args): Object}>host;

		let a = 'constructor';
		if (meta[a]) {
			let transport = this.event(a, (...args) => args, meta[a]);
			delete meta[a];

			class T extends classConstructor {
				constructor(...args) {
					super(...transport(...args));
				}
			}

			classConstructor = T;
		}

		let P = eval(`
			(class ${className}Intent extends classConstructor {
			});
		`);

		for (let event in meta) {
			P.prototype[event] = this.event(event, P.prototype[event], meta[event]);
		}

		return this.type(P);
	},
	call(target) {
		return (target instanceof Instance)
			? target.value
			: target;
	},
	bind(type) {
		return type.resolve.bind(type);
	},

};
