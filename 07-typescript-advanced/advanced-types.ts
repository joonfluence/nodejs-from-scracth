// ── Conditional Types ──

type IsString<T> = T extends string ? 'yes' : 'no';

type A = IsString<string>;  // 'yes'
type B = IsString<number>;  // 'no'
type C = IsString<'hello'>; // 'yes' — 리터럴도 string을 extends

// ── infer 키워드 — 타입을 "추출"하는 마법 ──

// 1. MyReturnType: 함수의 리턴 타입 추출
type MyReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

function getUser() { return { id: 1, name: '준호' }; }
type UserType = MyReturnType<typeof getUser>; // { id: number; name: string }

// 2. MyParameters: 함수의 파라미터 타입 추출
type MyParameters<T> = T extends (...args: infer P) => any ? P : never;

function createUser(name: string, age: number) { return { name, age }; }
type CreateUserParams = MyParameters<typeof createUser>; // [string, number]

// 3. UnwrapPromise: Promise 안의 타입 추출
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

type D = UnwrapPromise<Promise<string>>;           // string
type E = UnwrapPromise<Promise<{ id: number }>>;   // { id: number }
type F = UnwrapPromise<string>;                     // string (Promise 아니면 그대로)

// 4. ArrayElement: 배열 요소 타입 추출
type ArrayElement<T> = T extends (infer E)[] ? E : never;

type G = ArrayElement<string[]>;    // string
type H = ArrayElement<number[]>;    // number

// ── Mapped Types — Partial, Pick, Omit 직접 구현 ──

interface User {
  id: number;
  name: string;
  email: string;
  age: number;
}

// Partial 구현: 모든 프로퍼티를 optional로
type MyPartial<T> = {
  [K in keyof T]?: T[K];
};
type PartialUser = MyPartial<User>; // 모든 필드가 optional

// Pick 구현: 특정 프로퍼티만 선택
type MyPick<T, K extends keyof T> = {
  [P in K]: T[P];
};
type UserPreview = MyPick<User, 'id' | 'name'>; // { id: number; name: string }

// Omit 구현: 특정 프로퍼티를 제외
type MyOmit<T, K extends keyof T> = MyPick<T, Exclude<keyof T, K>>;
type UserWithoutEmail = MyOmit<User, 'email'>; // { id, name, age }

// Readonly 구현: 모든 프로퍼티를 읽기 전용으로
type MyReadonly<T> = {
  readonly [K in keyof T]: T[K];
};
type ReadonlyUser = MyReadonly<User>;

// ── 실전: API 응답 타입 설계 ──

type ApiResponse<T> =
  | { status: 'success'; data: T; error: null }
  | { status: 'error'; data: null; error: string };

function handleResponse(res: ApiResponse<User>) {
  if (res.status === 'success') {
    console.log(res.data.name); // ✅ data가 User로 좁혀짐
  } else {
    console.log(res.error);     // ✅ error가 string으로 좁혀짐
  }
}

/**
 * [관전 포인트]
 * 1. infer는 "여기에 들어오는 타입을 변수처럼 캡처해줘"라는 의미
 * 2. Mapped Types의 [K in keyof T]는 for-in 루프와 같은 원리
 * 3. Partial, Pick, Omit 내부를 이해하면 커스텀 유틸리티 타입을 자유롭게 만들 수 있다
 * 4. Discriminated Union(status 필드)으로 타입을 자동 좁힐 수 있다
 */
