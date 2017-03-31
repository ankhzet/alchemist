webpackJsonp([0,1],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

  "use strict";
  __webpack_require__(1);
  //# sourceMappingURL=background.js.map

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

  "use strict";
  const intent_1 = __webpack_require__(2);
  const values = ['', '+', '++', '+++', '^', '^^', '^^^'];
  function evaluate(label, value) {
      return `${values[value]}${label}${values[value]}`;
  }
  class Ingredient {
      constructor(name, value = 0) {
          this.name = name;
          this.value = value;
      }
      toString() {
          return `'${evaluate(this.name, this.value)}'`;
      }
  }
  class Formula {
      constructor(name, value, ingredients) {
          this.name = name;
          this.ingredients = ingredients;
          this.value = value;
      }
      toString() {
          return `{ Formula "${evaluate(this.name, this.value)}" [${this.ingredients.join(', ')}]}`;
      }
  }
  class Event {
      constructor(brew, step) {
          this.brew = brew;
          this.step = step;
      }
  }
  class Brew {
      constructor(formula, environment) {
          this.i = 0;
          this.formula = formula;
          this.environment = environment;
      }
      done() {
          return this.i >= 5;
      }
      event() {
          return new Event(this, ++this.i);
      }
      toString() {
          return `< Brewing ${this.formula} in ${this.environment} >`;
      }
  }
  class Environment {
  }
  class Cauldron {
      constructor(name) {
          this.name = name;
          this.environment = Alchemist.Environment();
      }
      put(ingredients) {
          return Alchemist.Formula('Wild fire scroll', 2, ingredients);
      }
      brew(formula) {
          return Alchemist.Brew(formula, this.environment);
      }
      toString() {
          return `{ Cauldron "${this.name}" }`;
      }
  }
  const I = {
      ingredient: intent_1.intent.type(Ingredient),
      ingredients: null,
      formula: intent_1.intent.type(Formula),
      brew: null,
      event: intent_1.intent.type(Event),
      environment: intent_1.intent.type(Environment),
      cauldron: null,
  };
  I.ingredients = intent_1.intent.array(I.ingredient);
  I.brew = intent_1.intent.describe(Brew, {
      constructor: {
          expects: [
              { formula: I.formula },
              { environment: I.environment },
          ],
      },
      done: {
          returns: intent_1.intent.boolean,
      },
      event: {
          returns: I.event,
      },
  });
  I.cauldron = intent_1.intent.describe(Cauldron, {
      put: {
          expects: [
              { ingredients: I.ingredients },
          ],
          returns: I.formula,
      },
      brew: {
          expects: [
              { formula: I.formula },
          ],
          returns: I.brew,
      },
  });
  const Alchemist = {
      Ingredient: intent_1.intent.bind(I.ingredient),
      Ingredients: intent_1.intent.bind(I.ingredients),
      Formula: intent_1.intent.bind(I.formula),
      Brew: intent_1.intent.bind(I.brew),
      Environment: intent_1.intent.bind(I.environment),
      Cauldron: intent_1.intent.bind(I.cauldron),
  };
  let cauldron = Alchemist.Cauldron('Profound tier cauldron');
  console.log(`Cauldron: ${cauldron}`);
  let ingredient1 = Alchemist.Ingredient('Zhenshen', 1);
  let ingredient2 = Alchemist.Ingredient('Lotus');
  let ingredients = Alchemist.Ingredients(ingredient1, ingredient2);
  console.log(`Ingredients: ${ingredients}`);
  let formula = intent_1.intent.call(cauldron).put(ingredients);
  console.log(`Formula: ${formula}`);
  let brew = intent_1.intent.call(cauldron).brew(formula);
  console.log(`Brew: ${brew}`);
  //# sourceMappingURL=alchemist.js.map

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

  "use strict";
  const instance_1 = __webpack_require__(3);
  const type_1 = __webpack_require__(4);
  class IntentNumber extends type_1.IntentType {
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
              : (instance) => (!(instance && instance.value.valueOf()))).strict();
      }
  }
  exports.IntentNumber = IntentNumber;
  class IntentArray extends type_1.IntentType {
      constructor(element) {
          super(Array);
          this.element = element;
          this.allow((instance) => {
              if (!(instance && instance.value instanceof Array))
                  return false;
              return instance.value.filter((e) => {
                  return !this.element.validate(e);
              }).length === 0;
          });
      }
      required() {
          let next = this._deny;
          return this.deny(next
              ? (instance) => (!(instance && instance.value.length)) || next(instance)
              : (instance) => (!(instance && instance.value.length))).strict();
      }
      toString() {
          return `${this.element.name}[]`;
      }
  }
  exports.IntentArray = IntentArray;
  function typeOf(arg) {
      if (!arg)
          return 'undefined';
      if (arg instanceof instance_1.Instance) {
          if (arg.resolver instanceof type_1.IntentType)
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
          ? ' => ' + specification.returns
          : '');
  }
  function unpackExpectation(event, all, e) {
      let name = Object.keys(all.expects[e])[0];
      let type = all.expects[e][name];
      if (!type)
          throw new Error(`${formatEvent(event, all)}: Invalid constraint for argument "${name}"`);
      return [name, type];
  }
  exports.intent = {
      string: new type_1.IntentType(String),
      number: new IntentNumber(),
      boolean: new type_1.IntentType(Boolean),
      type(instantiator) {
          return new type_1.IntentType(instantiator);
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
          return function (...args) {
              // console.log(`${formatEvent(event, specification)}:`, ...args);
              if (expects) {
                  for (let i in expects) {
                      let type = expects[i];
                      let arg = args[i];
                      if (arg && !(arg instanceof instance_1.Instance))
                          arg = instance_1.Instance.wrap(arg);
                      // console.log(`validate [${arg}] is [${type}]:`, type.validate(arg));
                      if (!type.validate(arg)) {
                          throw new Error(`${formatEvent(event, specification)}: Expected "${names[i]}" to be of type ${type}, ${typeOf(arg)} (${JSON.stringify(arg)}) passed.`);
                      }
                  }
              }
              let unwrap = (arg) => {
                  if (arg instanceof Array)
                      arg = arg.map(unwrap);
                  if (arg instanceof instance_1.Instance)
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
      describe(host, meta) {
          let className = host.name;
          let classConstructor = host;
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
          return (target instanceof instance_1.Instance)
              ? target.value
              : target;
      },
      bind(type) {
          return type.resolve.bind(type);
      },
  };
  //# sourceMappingURL=intent.js.map

/***/ },
/* 3 */
/***/ function(module, exports) {

  "use strict";
  class Instance {
      constructor(resolver, args) {
          this.resolver = resolver;
          this.args = args;
      }
      get value() {
          if (!this._value) {
              let constructor = this.resolver.instantiator();
              // console.log(constructor);
              if (this.args) {
                  this._value = new constructor(...this.args);
                  delete this.args;
              }
              else
                  this._value = constructor;
          }
          return this._value;
      }
      toString() {
          return `${this.value}`;
      }
      static wrap(value) {
          return new this({
              instantiator: () => value
          });
      }
  }
  exports.Instance = Instance;
  //# sourceMappingURL=instance.js.map

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

  "use strict";
  const constraint_1 = __webpack_require__(5);
  const instance_1 = __webpack_require__(3);
  class IntentType extends constraint_1.IntentConstraint {
      constructor(resolver) {
          super();
          this.resolver = resolver;
          this.deny((instance) => {
              return (!(instance && (instance.value instanceof resolver)));
          })
              .strict();
      }
      instantiator() {
          return this.resolver;
      }
      resolve(...args) {
          return new instance_1.Instance(this, args);
      }
      get name() {
          return this.instantiator().name;
      }
      toString() {
          return `${this.name}`;
      }
  }
  exports.IntentType = IntentType;
  //# sourceMappingURL=type.js.map

/***/ },
/* 5 */
/***/ function(module, exports) {

  "use strict";
  class IntentConstraint {
      required() {
          let next = this._deny;
          return this.deny(next
              ? (instance) => (!(instance && instance.value)) || next(instance)
              : (instance) => (!(instance && instance.value))).strict();
      }
      strict(is = true) {
          this._strict = is;
          return this;
      }
      allow(validator) {
          this._allow = validator;
          return this;
      }
      deny(validator) {
          this._deny = validator;
          return this;
      }
      validate(instance) {
          if (this._strict)
              return (!this.denied(instance)) && this.allowed(instance);
          else
              return this.allowed(instance) && (!this.denied(instance));
      }
      allowed(instance) {
          return (!this._allow) || this._allow(instance);
      }
      denied(instance) {
          return this._deny && this._deny(instance);
      }
  }
  exports.IntentConstraint = IntentConstraint;
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
  //# sourceMappingURL=constraint.js.map

/***/ }
]);