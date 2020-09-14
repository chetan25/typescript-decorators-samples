/**
 * This gets fired up when the Class it's attached to it is registered and not on instantiation
 * @param constructor
 * @constructor
 */
function Logger(constructor: Function) {
  console.log(`${constructor.name} Class is registered`);
}

@Logger
class Person {
  name = 'Max';

  constructor() {
    console.log('Creating person object...');
  }
}

const person1 = new Person();

// target - is either the prototype of the instance if we are adding to instance method
// or the constructor function if we are adding to static method
function AutoBind(target: any, methodName: string, descriptor: PropertyDescriptor) {
  console.log(target);
  console.log(methodName);
  const originalMethod = descriptor.value;
   const adjustedDescriptor: PropertyDescriptor = {
     configurable: true,
     enumerable: false,
     get() {
       // runs when somebody tries to get access the value

       // this always refer to the object we defined the getter method
       const boundFunction = originalMethod.bind(this);

       return boundFunction;
     }
   };

   // this will replace the old method descriptor with this new one
   return adjustedDescriptor;
}

class MagicalPrinter {
  message = "Show";

  /**
   *  This will auto bind this to the method
   *  @AutoBind
   */
  shoeMessage() {
    console.log(this.message);
  }
}

const printer = new MagicalPrinter();
const button = document.querySelector('button')!;
button.addEventListener('click', printer.shoeMessage);


// validation decorator

interface ValidatorConfig {
  [property: string]: {
    [validateableProp: string]: string[] // ['required', 'positive']
  }
}

const registeredValidators: ValidatorConfig = {};

function Required(target: any, propName: string) {
  // every instance has a constructor function which has a property called name
  registeredValidators[target.constructor.name] = {
    ...registeredValidators[target.constructor.name],
    [propName]: ['required']
  }
}

function Positive(target: any, propName: string) {
  // every instance has a constructor function which has a property called name
  registeredValidators[target.constructor.name] = {
    ...registeredValidators[target.constructor.name],
    [propName]: ['positive']
  }
}

function validate(obj: any) {
  const objValidatorConfig =registeredValidators[obj.constructor.name];
  if (!objValidatorConfig) {
    return true;
  }
  let isValid = true;
  for (const propertyName in objValidatorConfig) {
    for (const validator of objValidatorConfig[propertyName]) {
      switch(validator) {
        case 'required':
          isValid = isValid && !!obj[propertyName];
          break;
        case 'positive':
          isValid = isValid && obj[propertyName] > 0;
          break;
      }
    }
  }

  return isValid;
}

class Teacher {
  @Required
  name: string;
  @Positive
  subject: string;

  constructor(n: string, s: string) {
    this.name = n;
    this.subject = s;
  }
}

const form = document.querySelector('form')!;
form.addEventListener('submit', event => {
  event.preventDefault();
  const nameEl = document.getElementById('name') as HTMLInputElement;
  const subjectEl = document.getElementById('subject') as HTMLInputElement;

  const name = nameEl.value;
  const subject = subjectEl.value;

  const newTeacher = new Teacher(name, subject);
  if (!validate(newTeacher)) {
    alert('Name and Subject is Required');

    return;
  }

  console.log(newTeacher);
});