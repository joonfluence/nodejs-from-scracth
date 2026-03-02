// ── 구조적 타이핑 (Structural Typing) ──
// "오리처럼 걷고 오리처럼 울면 오리다"

interface Duck {
  walk(): void;
  quack(): void;
}

interface Person {
  walk(): void;
  quack(): void;
  name: string;
}

function makeDuckWalk(duck: Duck) {
  duck.walk();
  duck.quack();
}

const person: Person = {
  walk() { console.log('걷기'); },
  quack() { console.log('꽥'); },
  name: '준호',
};

// Person은 Duck의 모든 프로퍼티를 가지고 있으므로 OK
// Java(Nominal)라면 "Person implements Duck"이 필요하지만 TS는 구조만 보고 판단
makeDuckWalk(person); // ✅ 통과!

// ── type vs interface 차이 ──

// interface: 선언 병합 가능 (라이브러리 확장에 유리)
interface Config {
  host: string;
}
interface Config {
  port: number; // 같은 이름으로 선언하면 병합됨
}
const config: Config = { host: 'localhost', port: 3000 }; // 둘 다 필요

// type: 유니온, 인터섹션, 매핑 등 연산에 강함
type StringOrNumber = string | number; // interface로 불가
type Nullable<T> = T | null;

// ── Type Narrowing ──

function processValue(value: string | number | { type: string; data: unknown }) {
  // typeof
  if (typeof value === 'string') {
    console.log(value.toUpperCase()); // string으로 좁혀짐
    return;
  }

  // typeof
  if (typeof value === 'number') {
    console.log(value.toFixed(2)); // number로 좁혀짐
    return;
  }

  // in 연산자
  if ('type' in value) {
    console.log(value.type); // 객체 타입으로 좁혀짐
  }
}

// ── User-defined Type Guard ──

interface Cat { meow(): void; name: string; }
interface Dog { bark(): void; name: string; }

function isCat(animal: Cat | Dog): animal is Cat {
  return 'meow' in animal;
}

function handleAnimal(animal: Cat | Dog) {
  if (isCat(animal)) {
    animal.meow(); // Cat으로 좁혀짐
  } else {
    animal.bark(); // Dog으로 좁혀짐
  }
}

/**
 * [관전 포인트]
 * 1. TS는 타입 이름이 아니라 "구조"를 비교한다 (Java와 결정적 차이)
 * 2. interface는 선언 병합으로 확장 가능, type은 연산(유니온/인터섹션)에 강함
 * 3. typeof, in, instanceof, 커스텀 타입 가드로 런타임에서 타입을 좁힌다
 */
