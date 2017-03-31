
import { IntentConstraint } from './constraint';
import { InstantiatorResolver, InstanceValueConstructor, Instance } from './instance';

export class IntentType<T> extends IntentConstraint<T> implements InstantiatorResolver<T> {
	private resolver: InstanceValueConstructor<T>;

	constructor(resolver: InstanceValueConstructor<T>) {
		super();
		this.resolver = resolver;
		this.deny((instance) => {
			return (!(instance && (instance.value instanceof resolver)));
		})
		.strict();
	}

	public instantiator(): InstanceValueConstructor<T> {
		return this.resolver;
	}

	resolve(...args: any[]): Instance<T> {
		return new Instance(this, args);
	}

	get name(): string {
		return this.instantiator().name;
	}

	toString() {
		return `${this.name}`;
	}

}
