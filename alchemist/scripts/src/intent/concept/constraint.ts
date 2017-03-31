

import { Instance } from './instance';

export type InstanceValidator<T> = (instance: Instance<T>) => boolean;

export class IntentConstraint<T> {
	protected _allow: InstanceValidator<T>;
	protected _deny: InstanceValidator<T>;
	protected _strict: boolean;

	required(): this {
		let next = this._deny;
		return this.deny(next
			? (instance) => (!(instance && instance.value)) || next(instance)
			: (instance) => (!(instance && instance.value))
		).strict();
	}

	strict(is: boolean = true): this {
		this._strict = is;
		return this;
	}

	allow(validator: InstanceValidator<T>): this {
		this._allow = validator;
		return this;
	}

	deny(validator: InstanceValidator<T>): this {
		this._deny = validator;
		return this;
	}

	validate(instance: Instance<T>): boolean {
		if (this._strict)
			return (!this.denied(instance)) && this.allowed(instance);
		else
			return this.allowed(instance) && (!this.denied(instance));
	}

	protected allowed(instance: Instance<T>): boolean {
		return (!this._allow) || this._allow(instance);
	}

	protected denied(instance: Instance<T>): boolean {
		return this._deny && this._deny(instance);
	}

}

/*

	(no allow, no deny)
		false

	(   allow, no deny)
		allow
	(no allow,    deny)
		not deny

	(   allow,    deny)
		strict
			not deny and allow
		loose
			alow and not deny

 */
