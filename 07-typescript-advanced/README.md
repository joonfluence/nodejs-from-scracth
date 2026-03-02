# 07. TypeScript Advanced

구조적 타이핑, Type Narrowing, Conditional Types, infer, Mapped Types를 학습합니다.

## 파일 목록

| 파일 | 핵심 교훈 |
|------|-----------|
| [structural-typing.ts](./structural-typing.ts) | 구조적 타이핑, type vs interface, Type Narrowing, 커스텀 타입 가드 |
| [advanced-types.ts](./advanced-types.ts) | Conditional Types, infer, Partial/Pick/Omit 직접 구현 |

## 핵심 개념

- TS는 구조(프로퍼티)로 타입을 비교한다 (Java의 Nominal Typing과 다름)
- `interface`는 선언 병합 가능, `type`은 유니온/인터섹션 연산에 강함
- `typeof`, `in`, `instanceof`, `is` 키워드로 런타임에 타입을 좁힌다
- `infer`는 타입 추론 변수 — 함수 리턴 타입, 배열 요소 타입 등을 동적으로 추출
- `Partial`, `Pick`, `Omit`은 Mapped Types로 구현되어 있다

## 실행

```bash
# TypeScript 설치 (없으면)
npm install -g typescript

# 타입 체크만 (컴파일 안 함)
tsc --noEmit structural-typing.ts
tsc --noEmit advanced-types.ts

# 또는 ts-node로 실행
npx ts-node structural-typing.ts
```
