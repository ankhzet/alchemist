
export interface InstanceValueConstructor<T> {
	new (...args: any[]): T;
}

export interface InstantiatorResolver<T> {
	instantiator(): InstanceValueConstructor<T>;
}

export class Instance<T> {
	private resolver: InstantiatorResolver<T>;
	args: any[];
	_value: any;

	constructor(resolver: InstantiatorResolver<T>, args?: any[]) {
		this.resolver = resolver;
		this.args = args;
	}

	get value(): T {
		if (!this._value) {
			let constructor = this.resolver.instantiator();

			// console.log(constructor);
			if (this.args) {
				this._value = new constructor(...this.args);
				delete this.args;
			} else
				this._value = constructor;
		}

		return this._value;
	}

	toString() {
		return `${this.value}`;
	}

	static wrap(value: any) {
		return new this({
			instantiator: () => value
		});
	}

}
