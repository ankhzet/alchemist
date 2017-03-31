
1. instance
	1. has events
	
		```
		class Instance {
			type: Type;
			value: InstanceValue;
		}

		class InstanceValueImpl {
		
			event_1(param_1, param_2) {
			
			}
		
			event_2(param_1): returns {
			
			}

			event_3(): returns {
			
			}

		}
		```
		
2. type
	1. describes instances
	
		```
		type Validator = (instance: Instance) => boolean;
		
		class Type {
			allow: Validator;
			deny: Validator;
			strict: boolean;
		
			validate(instance) {
				let allow = 
				if (this.strict)
					return
				return this.validator(instance);
			}
		
		}
		```

	2. validates instances
	
		```
		
		number.validate(null); // false
		number.validate(number.resolve(null)); // false
		number.validate(number.resolve(10)); // true
		```
		
	3. validates constraints
	
		```
		
		let ten = number.allow((instance) => {
			return (instance.value >= 0) && (instance.value < 10);
		});
		
		ten.validate(number.resolve(null)); // false
		ten.validate(number.resolve(-1)); // false
		ten.validate(number.resolve(0)); // true
		ten.validate(number.resolve(5)); // true
		ten.validate(number.resolve(10)); // false
		
		```
