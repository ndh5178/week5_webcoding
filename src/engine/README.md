# Engine README

## 엔진이 하는 일

`src/engine`은 우리가 직접 만든 mini React 엔진입니다.

이 엔진은 크게 4가지를 합니다.

1. `App()` 같은 함수형 컴포넌트를 실행합니다.
2. `useState`, `useMemo`, `useEffect` 같은 hook 값을 기억합니다.
3. 함수가 돌려준 VDOM 객체를 실제 DOM으로 바꿉니다.
4. 상태가 바뀌면 새 VDOM을 만들고, 이전 VDOM과 비교해서 실제 화면을 업데이트합니다.

## 폴더별 역할

- [core](/C:/Users/user/Desktop/정글/수요코딩회/5주차/week5_webcoding/src/engine/core)
  - 컴포넌트를 실행하고 렌더 타이밍을 관리합니다.
- [hooks](/C:/Users/user/Desktop/정글/수요코딩회/5주차/week5_webcoding/src/engine/hooks)
  - `useState`, `useMemo`, `useEffect`를 구현합니다.
- [vdom](/C:/Users/user/Desktop/정글/수요코딩회/5주차/week5_webcoding/src/engine/vdom)
  - VDOM 객체를 만듭니다.
- [render](/C:/Users/user/Desktop/정글/수요코딩회/5주차/week5_webcoding/src/engine/render)
  - VDOM을 실제 DOM으로 바꾸고, diff/patch를 수행합니다.
- [shared](/C:/Users/user/Desktop/정글/수요코딩회/5주차/week5_webcoding/src/engine/shared)
  - 엔진과 앱이 같이 지키는 약속을 적어둡니다.

## 파일별 역할

### core

- [mountRoot.js](/C:/Users/user/Desktop/정글/수요코딩회/5주차/week5_webcoding/src/engine/core/mountRoot.js)
  - 앱 시작점입니다.
  - `App` 함수와 `#app` DOM을 받아서 `FunctionComponent`를 만들고 `mount()`를 호출합니다.

- [FunctionComponent.js](/C:/Users/user/Desktop/정글/수요코딩회/5주차/week5_webcoding/src/engine/core/FunctionComponent.js)
  - 루트 함수형 컴포넌트를 감싸는 클래스입니다.
  - `hooks`, `hookIndex`, `currentTree`, `pendingEffects`를 저장합니다.
  - `mount()`는 첫 렌더입니다.
  - `update()`는 상태 변경 후 재렌더입니다.
  - `performRender()`는 실제로 `App()`을 실행합니다.

- [runtime.js](/C:/Users/user/Desktop/정글/수요코딩회/5주차/week5_webcoding/src/engine/core/runtime.js)
  - 지금 렌더 중인 컴포넌트가 누구인지 저장합니다.
  - `useState`, `useMemo`, `useEffect`는 이 정보를 보고 "내가 어느 컴포넌트 안에서 실행 중인지" 압니다.

### hooks

- [useState.js](/C:/Users/user/Desktop/정글/수요코딩회/5주차/week5_webcoding/src/engine/hooks/useState.js)
  - 상태 값을 `hooks` 배열에 저장합니다.
  - `setState`가 호출되면 `component.update()`를 실행합니다.

- [useMemo.js](/C:/Users/user/Desktop/정글/수요코딩회/5주차/week5_webcoding/src/engine/hooks/useMemo.js)
  - 계산 결과를 기억합니다.
  - 의존성이 바뀌지 않으면 이전 계산 결과를 다시 씁니다.

- [useEffect.js](/C:/Users/user/Desktop/정글/수요코딩회/5주차/week5_webcoding/src/engine/hooks/useEffect.js)
  - 렌더가 끝난 뒤 실행할 작업을 등록합니다.
  - 예: 타이머, localStorage 저장, 콘솔 로그

### vdom

- [h.js](/C:/Users/user/Desktop/정글/수요코딩회/5주차/week5_webcoding/src/engine/vdom/h.js)
  - `h(type, props, ...children)` 함수가 있습니다.
  - 이 함수는 화면을 VDOM 객체로 만듭니다.
  - 문자열은 `TEXT_NODE`라는 특별한 텍스트 노드로 바꿉니다.

### render

- [createElement.js](/C:/Users/user/Desktop/정글/수요코딩회/5주차/week5_webcoding/src/engine/render/createElement.js)
  - VDOM 한 개를 실제 DOM 한 개로 바꿉니다.
  - props를 DOM에 적용합니다.
  - 이벤트를 연결합니다.
  - HTML과 SVG를 구분해서 만듭니다.

- [render.js](/C:/Users/user/Desktop/정글/수요코딩회/5주차/week5_webcoding/src/engine/render/render.js)
  - 첫 렌더에서는 DOM을 새로 붙입니다.
  - 이후 렌더에서는 이전 VDOM과 새 VDOM을 비교하고 patch를 호출합니다.

- [diff.js](/C:/Users/user/Desktop/정글/수요코딩회/5주차/week5_webcoding/src/engine/render/diff.js)
  - 이전 VDOM과 새 VDOM의 차이를 찾습니다.

- [patch.js](/C:/Users/user/Desktop/정글/수요코딩회/5주차/week5_webcoding/src/engine/render/patch.js)
  - diff 결과에 맞게 실제 DOM을 수정합니다.

## 첫 화면이 뜨는 전체 흐름

여기서는 `정글 성향 테스트` 첫 화면이 어떻게 뜨는지 아주 자세히 따라갑니다.

### 1. HTML 안에 빈 자리 하나가 있다

[index.html](/C:/Users/user/Desktop/정글/수요코딩회/5주차/week5_webcoding/index.html)

```html
<div id="app"></div>
```

이 `#app`은 "나중에 앱 화면이 붙을 자리"입니다.

아직은 비어 있습니다.

### 2. main.js가 앱 시작 함수를 부른다

[src/main.js](/C:/Users/user/Desktop/정글/수요코딩회/5주차/week5_webcoding/src/main.js)

```js
import { mountApp } from "./app/bootstrap.js";

mountApp();
```

여기서 실행되는 첫 앱 함수는 `mountApp()`입니다.

### 3. mountApp()이 실제 DOM 자리와 App 함수를 준비한다

[bootstrap.js](/C:/Users/user/Desktop/정글/수요코딩회/5주차/week5_webcoding/src/app/bootstrap.js)

```js
export function mountApp() {
  const root = document.querySelector("#app");
  mountRoot(App, root);
}
```

이 시점에 만들어지는 변수:

- `root`
  - 값: `document.querySelector("#app")`
  - 뜻: 실제 DOM 자리

그리고 이 호출이 일어납니다.

```js
mountRoot(App, root);
```

여기서 넘어가는 값:

- `componentFn = App`
- `container = root`
- `props = {}`

중요한 점:

- `App`
  - 함수 자체입니다.
  - 아직 `App()` 실행 결과가 아닙니다.
- `root`
  - 실제 DOM 요소입니다.

### 4. mountRoot()가 rootComponent를 만든다

[mountRoot.js](/C:/Users/user/Desktop/정글/수요코딩회/5주차/week5_webcoding/src/engine/core/mountRoot.js)

```js
export function mountRoot(componentFn, container, props = {}) {
  const rootComponent = new FunctionComponent(componentFn, props, container);
  rootComponent.mount();
  return rootComponent;
}
```

이때 생기는 변수:

- `rootComponent`
  - 값: `new FunctionComponent(App, {}, root)`
  - 뜻: App를 관리하는 엔진 객체

### 5. FunctionComponent constructor가 기본 상태를 만든다

[FunctionComponent.js](/C:/Users/user/Desktop/정글/수요코딩회/5주차/week5_webcoding/src/engine/core/FunctionComponent.js)

```js
constructor(componentFn, props = {}, container) {
  this.componentFn = componentFn;
  this.props = props;
  this.container = container;
  this.hooks = [];
  this.hookIndex = 0;
  this.currentTree = null;
  this.pendingEffects = [];
}
```

이 직후 `rootComponent` 안에는 대충 이런 값이 들어 있습니다.

```js
{
  componentFn: App,
  props: {},
  container: root,
  hooks: [],
  hookIndex: 0,
  currentTree: null,
  pendingEffects: []
}
```

뜻:

- `componentFn`
  - 나중에 실행할 함수
- `props`
  - 함수에 넣어줄 입력값
- `container`
  - 화면을 붙일 실제 DOM 자리
- `hooks`
  - hook 기억장치
- `hookIndex`
  - 이번 렌더에서 몇 번째 hook인지 세는 번호표
- `currentTree`
  - 현재 VDOM 트리
- `pendingEffects`
  - 렌더 후 실행할 effect 목록

### 6. mount()가 첫 렌더를 시작한다

```js
mount() {
  const tree = this.performRender();
  render(tree, this.container);
  this.currentTree = tree;
  this.runEffects();
}
```

이 함수는 아주 단순하게 4단계입니다.

1. `performRender()`로 VDOM 만들기
2. `render()`로 실제 DOM에 붙이기
3. `currentTree`에 저장하기
4. `runEffects()` 실행하기

### 7. performRender()가 렌더 준비를 한다

```js
performRender() {
  this.prepareToRender();

  try {
    this.currentTree = this.componentFn(this.props);
    return this.currentTree;
  } finally {
    this.finishRender();
  }
}
```

먼저 `prepareToRender()`가 실행됩니다.

```js
prepareToRender() {
  this.hookIndex = 0;
  this.pendingEffects = [];
  setCurrentComponent(this);
}
```

이 3줄의 뜻:

- `this.hookIndex = 0`
  - 이번 렌더에서 hook 순서를 처음부터 다시 세겠다는 뜻
- `this.pendingEffects = []`
  - 이번 렌더용 effect 목록을 새로 비우는 것
- `setCurrentComponent(this)`
  - 지금 렌더 중인 컴포넌트가 `rootComponent`라고 기록

### 8. 이제 진짜로 App()이 실행된다

`performRender()`의 이 줄이 핵심입니다.

```js
this.currentTree = this.componentFn(this.props);
```

지금 값으로 바꾸면 거의 이 뜻입니다.

```js
this.currentTree = App({});
```

즉 여기서 `App()`이 실제로 실행됩니다.

## App() 안에서 일어나는 일

### 9. useState가 appState를 만든다

[bootstrap.js](/C:/Users/user/Desktop/정글/수요코딩회/5주차/week5_webcoding/src/app/bootstrap.js)

```js
const [appState, setAppState] = useState({
  screen: "start",
  nickname: "",
  isNicknameComposing: false,
  currentIndex: 0,
  answers: [],
});
```

이때 `useState` 안에서는:

- `component = getCurrentComponent()`
  - 값: `rootComponent`
- `currentIndex = component.hookIndex`
  - 값: `0`

처음 렌더라서 `component.hooks[0]`은 비어 있습니다.

그래서 이 초기 상태가 hooks 배열 0번 칸에 저장됩니다.

```js
rootComponent.hooks[0] = {
  screen: "start",
  nickname: "",
  isNicknameComposing: false,
  currentIndex: 0,
  answers: [],
}
```

그리고 반환값:

- `appState`
  - 값: hooks[0]에 저장된 상태 객체
- `setAppState`
  - 값: hooks[0] 상태를 바꾸고 `update()`를 부르는 함수

그 뒤 `hookIndex`는 1이 됩니다.

### 10. useMemo가 calculated를 만든다

```js
const calculated = useMemo(() => {
  return evaluateQuizResult({
    questions: quizQuestions,
    answers: appState.answers,
    axes: quizConfig.axes,
    results: quizResults,
  });
}, [appState.answers]);
```

이때:

- `currentIndex = 1`
- `hooks[1]`은 아직 비어 있음

그래서 `factory` 함수가 한 번 실행됩니다.

즉 이 계산이 일어납니다.

```js
evaluateQuizResult(...)
```

그 결과가 `hooks[1]`에 저장됩니다.

### 11. useMemo가 bestMatchResult를 만든다

```js
const bestMatchResult = useMemo(() => {
  if (!calculated.result?.bestMatch) return null;
  return quizResults.find((item) => item.id === calculated.result.bestMatch) || null;
}, [calculated.result]);
```

이때:

- `currentIndex = 2`
- `hooks[2]`에 memo 결과 저장

### 12. 일반 변수와 이벤트 함수들이 만들어진다

이제 `App()` 안에서 이런 값들이 만들어집니다.

- `startConfig`
- `handleStart`
- `handleNicknameInput`
- `handleNicknameCompositionStart`
- `handleNicknameCompositionEnd`
- `handleNicknameSubmit`
- `handleChoiceSelect`
- `handlePrevQuestion`
- `handleNextQuestion`
- `handleFinishQuiz`
- `handleRestart`

이 함수들은 "지금 바로 실행"되는 게 아닙니다.

예를 들어 `handleStart`는 첫 화면 버튼을 눌렀을 때 나중에 실행될 함수입니다.

### 13. 첫 화면인지 검사한다

첫 렌더에서 `appState.screen` 값은 `"start"`입니다.

그래서 이 조건이 참입니다.

```js
if (appState.screen === "start") {
  return StartPage({
    config: startConfig,
    onStart: handleStart,
  });
}
```

즉 `App()`은 결국 `StartPage(...)`가 만든 VDOM을 반환합니다.

### 14. StartPage()가 VDOM 트리를 만든다

[pages.js](/C:/Users/user/Desktop/정글/수요코딩회/5주차/week5_webcoding/src/app/components/pages.js)

`StartPage()` 안에서는 다시 작은 함수들을 조립합니다.

예:

- `HeaderLogo()`
- `PrimaryButton({ onClick: onStart, ... })`
- `AppShell(...)`

그리고 이 함수들 안에서는 모두 `h()`를 사용해서 VDOM 객체를 만듭니다.

즉 브라우저에 진짜 `<button>`을 바로 만드는 게 아니라, 먼저 이런 느낌의 설계도를 만듭니다.

```js
{
  type: "button",
  props: { onClick: handleStart, className: "..." },
  children: [...]
}
```

이 설계도 전체 묶음이 `tree`입니다.

### 15. finishRender()가 렌더 중 표시를 지운다

`App()` 실행이 끝나면 `finally`가 항상 실행됩니다.

```js
finishRender() {
  clearCurrentComponent();
}
```

즉 `currentComponent = null`이 됩니다.

뜻:

- 렌더 끝
- 이제 더 이상 "지금 렌더 중인 컴포넌트"는 없음

### 16. render(tree, container)가 실제 DOM을 만든다

이제 다시 `mount()`로 돌아와서:

```js
render(tree, this.container);
```

가 실행됩니다.

값:

- `tree`
  - 첫 화면 VDOM
- `this.container`
  - `#app` DOM

### 17. createElement()가 VDOM을 진짜 DOM으로 바꾼다

[createElement.js](/C:/Users/user/Desktop/정글/수요코딩회/5주차/week5_webcoding/src/engine/render/createElement.js)

이 함수가 하는 일:

1. 텍스트인지 확인
2. 태그인지 확인
3. 실제 DOM 요소 생성
4. props 적용
5. children도 같은 방식으로 생성

결국 브라우저에는 이런 실제 DOM이 생깁니다.

- `main`
- `section`
- `div`
- `h1`
- `p`
- `button`

그래서 화면에 `정글 성향 테스트` 시작 페이지가 보입니다.

### 18. currentTree에 저장한다

```js
this.currentTree = tree;
```

이제 현재 화면 설계도가 저장됩니다.

이 값은 다음에 버튼을 눌러서 화면이 바뀔 때 "이전 화면"으로 쓰입니다.

### 19. runEffects()를 실행한다

```js
this.runEffects();
```

첫 화면에서는 아직 앱에서 `useEffect`를 쓰지 않으므로 실행할 effect가 없습니다.

## 첫 화면에서 닉네임 화면으로 넘어가는 흐름

이제 진짜 중요한 부분입니다.

사용자가 첫 화면의 시작 버튼을 눌렀다고 가정하겠습니다.

### 1. 시작 버튼에는 onClick이 들어 있다

`App()`은 첫 화면에서 이렇게 반환했습니다.

```js
return StartPage({
  config: startConfig,
  onStart: handleStart,
});
```

즉 `StartPage`는 `onStart`라는 props를 받았습니다.

그 `onStart`의 진짜 값은 `handleStart` 함수입니다.

### 2. StartPage 안의 버튼이 onStart를 받는다

`StartPage()` 안에서는 버튼 컴포넌트에 이런 식으로 내려갑니다.

```js
PrimaryButton({
  onClick: onStart,
  ...
})
```

즉 버튼의 `onClick` 안에 결국 `handleStart`가 들어갑니다.

### 3. createElement()가 버튼에 실제 클릭 이벤트를 단다

`createElement.js` 안의 `setProp()`가 이걸 처리합니다.

```js
if (isEventProp(propName) && typeof propValue === "function") {
  const eventName = propName.slice(2).toLowerCase();
  element.addEventListener(eventName, propValue);
  return;
}
```

지금 상황에 대입하면:

- `propName = "onClick"`
- `propValue = handleStart`
- `eventName = "click"`

결과:

```js
button.addEventListener("click", handleStart)
```

즉 버튼을 누르면 이제 `handleStart()`가 실행됩니다.

### 4. 사용자가 버튼을 누른다

브라우저가 실제 클릭 이벤트를 감지합니다.

그러면 `handleStart()`가 실행됩니다.

```js
const handleStart = () => {
  setAppState((prev) => ({
    ...prev,
    screen: "nickname",
  }));
};
```

### 5. setAppState가 hooks[0] 상태를 바꾼다

`setAppState`는 `useState`가 만들어준 함수입니다.

이 함수는 내부에서:

1. 이전 상태를 읽고
2. 새 상태를 만들고
3. `component.hooks[currentIndex]`에 저장한 뒤
4. `component.update()`를 호출합니다

버튼을 누른 뒤 hooks[0]은 이렇게 바뀝니다.

이전:

```js
{
  screen: "start",
  nickname: "",
  isNicknameComposing: false,
  currentIndex: 0,
  answers: [],
}
```

이후:

```js
{
  screen: "nickname",
  nickname: "",
  isNicknameComposing: false,
  currentIndex: 0,
  answers: [],
}
```

즉 바뀐 핵심은 딱 하나입니다.

- `screen: "start"` -> `screen: "nickname"`

### 6. update()가 재렌더를 시작한다

상태가 바뀌었으니 엔진은 다시 렌더합니다.

```js
update() {
  const previousTree = this.currentTree;
  const tree = this.performRender();
  render(tree, this.container, previousTree);
  this.currentTree = tree;
  this.runEffects();
}
```

이 시점 변수:

- `previousTree`
  - 값: 시작 페이지 VDOM
- `tree`
  - 값: 새로 다시 만든 닉네임 페이지 VDOM

### 7. App()이 다시 실행된다

`performRender()`가 또 호출되므로 `App()`도 다시 실행됩니다.

하지만 이번엔 hooks[0]에 저장된 상태가 이미 바뀌어 있습니다.

즉 이번 렌더에서 `appState.screen` 값은 `"nickname"`입니다.

### 8. 이번에는 NicknamePage 분기로 들어간다

이제 이 조건이 참이 됩니다.

```js
if (appState.screen === "nickname") {
  return NicknamePage({
    nickname: appState.nickname,
    onInputNickname: handleNicknameInput,
    onSubmitNickname: handleNicknameSubmit,
    onNicknameCompositionStart: handleNicknameCompositionStart,
    onNicknameCompositionEnd: handleNicknameCompositionEnd,
  });
}
```

즉 `App()`이 이번에는 `NicknamePage(...)`의 VDOM을 반환합니다.

### 9. render()가 이전 트리와 새 트리를 비교한다

이번엔 첫 렌더가 아니라 업데이트 렌더이므로 `render()`는 이전 트리도 받습니다.

즉:

- 이전 트리: `StartPage` VDOM
- 새 트리: `NicknamePage` VDOM

이 둘을 비교한 뒤 `patch()`가 실제 DOM을 바꿉니다.

### 10. 브라우저 화면이 닉네임 페이지로 바뀐다

결과적으로 사용자가 보는 건:

- 처음: 시작 페이지
- 버튼 클릭 후: 닉네임 입력 페이지

입니다.

정리하면 버튼 한 번의 흐름은 이렇습니다.

1. `button.click`
2. `handleStart()`
3. `setAppState(...)`
4. `hooks[0]` 상태 변경
5. `rootComponent.update()`
6. `performRender()`
7. `App()` 재실행
8. `NicknamePage(...)` 반환
9. `render(tree, container, previousTree)`
10. `diff + patch`
11. 실제 DOM 변경

## 초정밀 추적: 첫 화면에서 닉네임 화면으로 갈 때 실제 값은 어떻게 바뀌나

여기부터는 정말 "실행 추적 로그"처럼 봐도 됩니다.

설명 기준 상황:

- 브라우저가 이미 첫 화면을 그리고 있음
- 사용자가 `나는 어떤 정글 동물일까?` 버튼을 누름

### 시작 버튼을 누르기 직전 상태

이 시점의 중요한 값:

```js
root = document.querySelector("#app")
```

```js
rootComponent = {
  componentFn: App,
  props: {},
  container: root,
  hooks: [
    {
      screen: "start",
      nickname: "",
      isNicknameComposing: false,
      currentIndex: 0,
      answers: []
    },
    {
      type: "memo",
      dependencies: [[]],
      value: {
        scores: {
          /* 축별 점수 */
        },
        directions: {
          /* 축별 방향 */
        },
        result: {
          /* 결과 타입 */
        }
      }
    },
    {
      type: "memo",
      dependencies: [
        {
          /* calculated.result */
        }
      ],
      value: null
    }
  ],
  hookIndex: 3,
  currentTree: {
    type: "main",
    props: { className: "app-shell" },
    children: [
      /* StartPage가 만든 VDOM 트리 */
    ]
  },
  pendingEffects: []
}
```

사용자가 보고 있는 화면:

- 로고
- `정글 성향 테스트` 제목
- 설명 문구
- 시작 버튼

### 1. 버튼 DOM 안에는 클릭 함수가 이미 연결되어 있다

시작 버튼은 VDOM 단계에서 대충 이런 모양이었습니다.

```js
{
  type: "button",
  props: {
    className: "primary-button",
    onClick: handleStart
  },
  children: [
    {
      type: "TEXT_NODE",
      props: { nodeValue: "나는 어떤 정글 동물일까?" },
      children: []
    }
  ]
}
```

그리고 `createElement()`가 이 VDOM을 실제 DOM으로 바꾸면서

```js
button.addEventListener("click", handleStart)
```

를 실행해둔 상태입니다.

즉 실제 버튼은 이미 `handleStart`를 알고 있습니다.

### 2. 사용자가 버튼을 누른다

브라우저가 클릭을 감지합니다.

그 결과 실행되는 함수:

```js
handleStart()
```

### 3. handleStart()가 실행된다

[bootstrap.js](/C:/Users/user/Desktop/정글/수요코딩회/5주차/week5_webcoding/src/app/bootstrap.js)

```js
const handleStart = () => {
  setAppState((prev) => ({
    ...prev,
    screen: "nickname",
  }));
};
```

#### handleStart의 입력값

- 직접 받는 매개변수 없음

#### handleStart 안에서 호출하는 것

- `setAppState(updaterFunction)`

여기서 `updaterFunction`은 이 함수입니다.

```js
(prev) => ({
  ...prev,
  screen: "nickname",
})
```

이 함수 뜻:

- 이전 상태 객체를 복사하고
- `screen`만 `"nickname"`으로 바꾼 새 객체를 만들어라

#### handleStart의 반환값

- 명시적 `return`이 없으므로 `undefined`

중요:

- `handleStart`는 화면을 직접 바꾸지 않습니다.
- 상태 변경 요청만 합니다.

### 4. setAppState가 실행된다

`setAppState`는 `useState`가 만들어준 함수입니다.

대충 이런 역할을 합니다.

```js
setState(nextValueOrUpdater) {
  const previousValue = component.hooks[currentIndex];
  const nextValue =
    typeof nextValueOrUpdater === "function"
      ? nextValueOrUpdater(previousValue)
      : nextValueOrUpdater;

  component.hooks[currentIndex] = nextValue;
  component.update();
}
```

#### setAppState가 알고 있는 값

이 함수는 처음 `useState`가 실행될 때 만들어졌기 때문에, 자기 안에 이런 정보를 기억하고 있습니다.

- `component = rootComponent`
- `currentIndex = 0`

즉:

- 내 상태 저장 위치는 `rootComponent.hooks[0]`

를 알고 있습니다.

### 5. setAppState가 이전 상태를 꺼낸다

```js
previousValue = rootComponent.hooks[0]
```

실제 값:

```js
{
  screen: "start",
  nickname: "",
  isNicknameComposing: false,
  currentIndex: 0,
  answers: []
}
```

### 6. updaterFunction이 실행된다

아까 `handleStart`가 넘긴 함수:

```js
(prev) => ({
  ...prev,
  screen: "nickname",
})
```

에 `previousValue`를 넣어서 실행하면:

입력값:

```js
prev = {
  screen: "start",
  nickname: "",
  isNicknameComposing: false,
  currentIndex: 0,
  answers: []
}
```

반환값:

```js
{
  screen: "nickname",
  nickname: "",
  isNicknameComposing: false,
  currentIndex: 0,
  answers: []
}
```

즉 새 상태 객체가 만들어집니다.

### 7. hooks[0]이 새 값으로 바뀐다

변경 전:

```js
rootComponent.hooks[0] = {
  screen: "start",
  nickname: "",
  isNicknameComposing: false,
  currentIndex: 0,
  answers: []
}
```

변경 후:

```js
rootComponent.hooks[0] = {
  screen: "nickname",
  nickname: "",
  isNicknameComposing: false,
  currentIndex: 0,
  answers: []
}
```

이 시점 핵심:

- 화면이 바뀔 준비는 끝남
- 하지만 아직 DOM은 안 바뀜

### 8. setAppState가 component.update()를 부른다

즉 실제로는 이런 호출이 일어납니다.

```js
rootComponent.update()
```

이제부터 엔진이 다시 렌더를 시작합니다.

### 9. update()가 previousTree를 저장한다

`update()` 내부:

```js
update() {
  const previousTree = this.currentTree;
  const tree = this.performRender();
  render(tree, this.container, previousTree);
  this.currentTree = tree;
  this.runEffects();
}
```

이 시점 변수:

```js
previousTree = rootComponent.currentTree
```

실제 의미:

- `previousTree`는 시작 화면 VDOM

대충 이런 느낌입니다.

```js
previousTree = {
  type: "main",
  props: { className: "app-shell" },
  children: [
    {
      type: "section",
      props: { className: "start-page" },
      children: [
        /* 시작 화면 요소들 */
      ]
    }
  ]
}
```

### 10. update()가 performRender()를 부른다

```js
const tree = this.performRender();
```

여기서 아직 `tree` 값은 정해지지 않았고,
곧 `App()`을 다시 실행해서 새 VDOM을 만들게 됩니다.

### 11. prepareToRender()가 다시 호출된다

```js
prepareToRender() {
  this.hookIndex = 0;
  this.pendingEffects = [];
  setCurrentComponent(this);
}
```

이 시점 변화:

- `rootComponent.hookIndex = 0`
- `rootComponent.pendingEffects = []`
- `currentComponent = rootComponent`

왜 다시 0으로 돌리냐:

- `App()` 안의 hook 순서가 항상 같기 때문입니다.
- 첫 번째 hook은 늘 `useState`
- 두 번째 hook은 늘 `useMemo(calculated)`
- 세 번째 hook은 늘 `useMemo(bestMatchResult)`

그래서 렌더할 때마다 0부터 다시 읽어야 같은 칸을 찾습니다.

### 12. App()이 두 번째로 실행된다

실행 코드:

```js
this.componentFn(this.props)
```

실제 값으로 바꾸면:

```js
App({})
```

#### App의 입력값

- `props = {}`

#### App 안에서 제일 먼저 하는 일

```js
const [appState, setAppState] = useState(...)
```

### 13. 두 번째 렌더에서 useState는 무엇을 반환하나

이번엔 처음 렌더가 아니라서 `hooks[0]`이 이미 존재합니다.

즉 `useState`가 보는 값:

```js
component = rootComponent
currentIndex = 0
component.hooks[0] = {
  screen: "nickname",
  nickname: "",
  isNicknameComposing: false,
  currentIndex: 0,
  answers: []
}
```

그러므로 이번 `useState` 반환값:

- `appState`

```js
{
  screen: "nickname",
  nickname: "",
  isNicknameComposing: false,
  currentIndex: 0,
  answers: []
}
```

- `setAppState`
  - 같은 상태 칸 `hooks[0]`을 바꾸는 함수

즉 핵심은:

- 첫 렌더에서는 초기값을 저장했고
- 두 번째 렌더에서는 저장된 값을 읽어옵니다

### 14. 두 번째 렌더의 useMemo(calculated)는 무엇을 반환하나

다음 코드:

```js
const calculated = useMemo(() => {
  return evaluateQuizResult({
    questions: quizQuestions,
    answers: appState.answers,
    axes: quizConfig.axes,
    results: quizResults,
  });
}, [appState.answers]);
```

지금 `appState.answers`는 여전히 빈 배열입니다.

즉 의존성은 첫 렌더와 사실상 같은 상태입니다.

그래서 `useMemo`는 보통:

- 이전 `hooks[1]`을 보고
- dependency가 안 바뀌었다고 판단하면
- 이전 계산값을 그대로 반환합니다

반환값:

```js
calculated = rootComponent.hooks[1].value
```

즉 새로 무거운 계산을 하지 않고 저장된 결과를 다시 씁니다.

### 15. 두 번째 렌더의 bestMatchResult도 반환된다

세 번째 hook도 같은 방식입니다.

반환값:

```js
bestMatchResult = rootComponent.hooks[2].value
```

지금은 아직 답변이 없으므로 대개 `null`입니다.

### 16. 이번엔 start 분기가 아니라 nickname 분기로 간다

이제 `appState.screen`을 봅니다.

현재 값:

```js
appState.screen === "nickname"
```

그래서 이 코드를 탑니다.

```js
if (appState.screen === "nickname") {
  return NicknamePage({
    nickname: appState.nickname,
    onInputNickname: handleNicknameInput,
    onSubmitNickname: handleNicknameSubmit,
    onNicknameCompositionStart: handleNicknameCompositionStart,
    onNicknameCompositionEnd: handleNicknameCompositionEnd,
  });
}
```

#### NicknamePage에 넘기는 입력값

```js
{
  nickname: "",
  onInputNickname: handleNicknameInput,
  onSubmitNickname: handleNicknameSubmit,
  onNicknameCompositionStart: handleNicknameCompositionStart,
  onNicknameCompositionEnd: handleNicknameCompositionEnd
}
```

#### NicknamePage의 반환값

- 닉네임 입력 화면을 설명하는 VDOM 객체

대충 이런 모양입니다.

```js
{
  type: "main",
  props: { className: "app-shell" },
  children: [
    {
      type: "section",
      props: { className: "nickname-page" },
      children: [
        {
          type: "input",
          props: {
            value: "",
            onInput: handleNicknameInput
          },
          children: []
        },
        {
          type: "button",
          props: {
            onClick: handleNicknameSubmit
          },
          children: [
            {
              type: "TEXT_NODE",
              props: { nodeValue: "다음으로" },
              children: []
            }
          ]
        }
      ]
    }
  ]
}
```

이 반환값이 바로 새 `tree`가 됩니다.

### 17. performRender()의 반환값은 새 tree다

즉:

```js
tree = {
  /* NicknamePage가 만든 VDOM */
}
```

`performRender()` 반환값:

- 닉네임 페이지 VDOM 트리

### 18. render(tree, container, previousTree)가 실행된다

이제 `update()` 안에서:

```js
render(tree, this.container, previousTree)
```

가 실행됩니다.

실제 값:

- `tree`
  - 닉네임 페이지 VDOM
- `container`
  - `root`
- `previousTree`
  - 시작 페이지 VDOM

### 19. render()는 이전 트리와 새 트리를 비교한다

즉:

- 이전 화면은 시작 페이지
- 새 화면은 닉네임 페이지

이 둘의 차이를 찾습니다.

이 단계에서 일어나는 일:

1. `diffTrees(previousTree, tree)` 같은 비교
2. `patch(...)` 호출
3. 실제 DOM 수정

### 20. 실제 DOM 결과가 바뀐다

브라우저 관점에서 보면:

- 시작 버튼이 있던 첫 화면 DOM이 사라지고
- 닉네임 입력창과 다음 버튼이 있는 DOM으로 바뀝니다

즉 사용자가 보는 최종 결과:

- `정글 성향 테스트 시작 페이지`
  - 에서
- `닉네임 입력 페이지`
  - 로 전환

### 21. update()가 currentTree를 새 트리로 바꾼다

```js
this.currentTree = tree;
```

즉 이제 `rootComponent.currentTree`는 더 이상 시작 페이지가 아닙니다.

변경 전:

```js
rootComponent.currentTree = StartPage VDOM
```

변경 후:

```js
rootComponent.currentTree = NicknamePage VDOM
```

이 값은 다음 입력 이벤트가 일어날 때 "이전 화면"으로 다시 쓰입니다.

### 22. update()의 최종 결과

함수별 최종 결과를 한 번에 보면:

- `handleStart()`
  - 반환값: `undefined`
  - 한 일: 상태 변경 요청

- `setAppState(updater)`
  - 반환값: 보통 사용 안 함
  - 한 일: `hooks[0]` 값 변경 + `update()` 호출

- `update()`
  - 반환값: 보통 사용 안 함
  - 한 일: 새 렌더 수행

- `performRender()`
  - 반환값: 닉네임 페이지 VDOM

- `App()`
  - 반환값: `NicknamePage(...)`가 만든 VDOM

- `NicknamePage(...)`
  - 반환값: 닉네임 화면 VDOM

- `render(...)`
  - 반환값: 보통 사용 안 함
  - 한 일: 실제 DOM 변경

## 한 줄씩 아주 짧게 다시 요약

```js
button click
-> handleStart()
-> setAppState(prev => ({ ...prev, screen: "nickname" }))
-> hooks[0].screen 이 "start" 에서 "nickname" 으로 바뀜
-> rootComponent.update()
-> App() 다시 실행
-> 이번에는 StartPage가 아니라 NicknamePage를 return
-> render()가 이전 트리와 새 트리를 비교
-> 실제 화면이 닉네임 페이지로 바뀜
```

## createElement.js를 아주 쉽게 이해하기

여기는 초보자가 가장 헷갈리기 쉬운 부분만 모아서 설명합니다.

### 이 파일의 목표

[createElement.js](/C:/Users/user/Desktop/정글/수요코딩회/5주차/week5_webcoding/src/engine/render/createElement.js)

이 파일의 목표는 단 하나입니다.

`VDOM 설계도를 실제 DOM으로 바꾸기`

예를 들어:

```js
{ type: "button", props: {...}, children: [...] }
```

같은 설계도를

```html
<button>...</button>
```

라는 진짜 브라우저 요소로 바꾸는 파일입니다.

## 여기 나오는 것들 분류

코드를 읽을 때 "이게 어디서 온 거지?"가 제일 어렵습니다.

### 1. 우리가 직접 만든 것

- `TEXT_NODE`
  - [h.js](/C:/Users/user/Desktop/정글/수요코딩회/5주차/week5_webcoding/src/engine/vdom/h.js)에서 `import`한 값
- `isEventProp`
- `isStyleObject`
- `applyStyleObject`
- `isSvgElement`
- `setProp`
- `removeProp`
- `updateDomProps`
- `createElement`
- `createElementWithNamespace`

즉 이 파일 안에서 `function ...`으로 적은 건 우리가 만든 함수입니다.

### 2. JavaScript가 원래 가지고 있는 것

- `Set`
- `Object.keys`
- `Object.entries`
- `Array.isArray`
- `String.prototype.startsWith`
- `String.prototype.slice`
- `String.prototype.toLowerCase`

이건 우리가 만든 게 아니라 JavaScript 기본 기능입니다.

### 3. 브라우저가 원래 가지고 있는 것

- `document.createElement`
- `document.createElementNS`
- `document.createTextNode`
- `element.addEventListener`
- `element.removeEventListener`
- `element.setAttribute`
- `element.removeAttribute`
- `element.appendChild`
- `element.style`
- `element.className`

이건 브라우저가 HTML을 다룰 때 원래 제공하는 기능입니다.

## `||`는 무슨 뜻이야?

`||`는 아주 쉽게 말하면:

`왼쪽 값이 비어 있거나 못 믿겠으면 오른쪽 값을 써라`

입니다.

예:

```js
const title = userTitle || "기본 제목";
```

뜻:

- `userTitle`이 있으면 그걸 쓰고
- 없으면 `"기본 제목"`을 쓰자

`createElement.js`에서 이 줄을 보세요.

```js
updateDomProps(element, {}, vNode.props || {});
```

뜻:

- `vNode.props`가 있으면 그걸 쓰고
- 혹시 없으면 빈 객체 `{}`를 써라

왜냐하면 `props`가 없는 노드도 있기 때문입니다.

## `?.`는 무슨 뜻이야?

`?.`는 아주 쉽게 말하면:

`왼쪽이 진짜 있을 때만 다음으로 가라`

입니다.

예:

```js
user?.name
```

뜻:

- `user`가 있으면 `user.name`
- `user`가 없으면 그냥 멈추고 `undefined`

오류를 막아주는 안전장치입니다.

`createElement.js`의 예:

```js
return element?.namespaceURI === SVG_NAMESPACE;
```

뜻:

- `element`가 있으면 `namespaceURI`를 보고 비교
- `element`가 없으면 에러 내지 말고 그냥 `undefined === SVG_NAMESPACE`

즉 결과는 `false`처럼 처리됩니다.

## `??`는 무슨 뜻이야?

코드에 이런 것도 있습니다.

```js
propValue ?? ""
```

뜻:

- `propValue`가 `null`이나 `undefined`가 아니면 그 값을 쓰고
- 정말 비어 있으면 `""`를 쓰자

즉 `||`랑 비슷하지만 더 조심스러운 버전입니다.

## SVG를 왜 따로 관리해?

이건 아주 중요합니다.

HTML 태그와 SVG 태그는 겉보기엔 비슷하지만 브라우저 입장에서는 "다른 종류의 물건"입니다.

예:

- HTML
  - `div`, `button`, `p`
- SVG
  - `svg`, `path`, `circle`, `rect`

브라우저에게 그냥 `createElement("svg")`만 하면, 어떤 환경에서는 "그냥 이상한 HTML 태그"처럼 다뤄질 수 있습니다.

그래서 SVG는 이렇게 만듭니다.

```js
document.createElementNS(SVG_NAMESPACE, vNode.type)
```

여기서 `NS`는 namespace의 줄임말입니다.

쉽게 말하면:

- HTML은 보통 글상자, 버튼 같은 일반 부품
- SVG는 그림판 도형 부품

그래서 브라우저에게

`이건 일반 HTML이 아니라 그림용 SVG야`

라고 알려줘야 합니다.

그래서 SVG를 따로 분리해서 관리합니다.

## createElement.js 핵심 함수 한 줄씩 해석

### `isEventProp(name)`

```js
function isEventProp(name) {
  return name.startsWith("on");
}
```

뜻:

- 이름이 `on`으로 시작하면 이벤트 props라고 보자
- 예: `onClick`, `onInput`

### `isStyleObject(value)`

```js
function isStyleObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
```

뜻:

- `null`이 아니고
- 타입이 객체이고
- 배열이 아니면
- style 객체로 보자

즉:

```js
{ color: "red", backgroundColor: "black" }
```

같은 값을 찾는 함수입니다.

### `applyStyleObject(element, previousStyle, nextStyle)`

뜻:

- 예전 스타일에서 사라진 건 지우고
- 새 스타일은 다시 넣는다

즉 style 전용 patch 함수입니다.

### `isSvgElement(element)`

뜻:

- 지금 이 DOM 요소가 SVG 세계에 속한 요소인지 확인

### `setProp(element, propName, propValue)`

뜻:

- prop 하나를 실제 DOM에 붙이는 함수

하는 일 여러 개:

1. `nodeValue`, `key`는 건너뜀
2. 이벤트면 `addEventListener`
3. `className`이면 클래스 적용
4. style 객체면 스타일 적용
5. 일반 DOM 속성이면 `element[propName] = propValue`
6. 마지막으로 attribute로 붙임

### `removeProp(element, propName, propValue)`

뜻:

- prop 하나를 실제 DOM에서 떼는 함수

### `updateDomProps(element, oldProps, newProps)`

뜻:

- 예전 props와 새 props를 비교해서
- 필요한 부분만 바꾼다

즉:

- 없어진 건 제거
- 새로 생긴 건 추가
- 바뀐 건 교체

### `createElement(vNode)`

뜻:

- VDOM 노드 한 개를 실제 DOM 노드 한 개로 바꾸는 입구 함수

### `createElementWithNamespace(vNode, inSvgNamespace)`

뜻:

- 실제로 재귀를 돌면서 DOM을 만드는 본체 함수

중요한 코드:

```js
const shouldUseSvgNamespace = inSvgNamespace || SVG_TAGS.has(vNode.type);
```

아주 쉽게 해석하면:

- 이미 SVG 안쪽에 들어와 있거나
- 지금 태그가 `svg`, `path`, `circle` 같은 SVG 태그면
- 이번 요소도 SVG 방식으로 만들자

즉 `||`는 여기서

`둘 중 하나라도 맞으면 true`

라는 뜻입니다.

## 첫 화면에서 닉네임 화면으로 갈 때, createElement.js는 어디서 쓰일까?

### 첫 렌더 때

- `StartPage` VDOM 생성
- `createElement()`가 실제 시작 화면 DOM 생성

### 버튼 클릭 후

- `NicknamePage` VDOM 생성
- `render()`가 이전/새 트리 비교
- `patch()`가 실제 DOM 수정
- 필요할 때 내부적으로 prop 업데이트에서 `updateDomProps()` 같은 로직 사용

즉 이 파일은

`설계도 -> 실제 화면`

으로 바꾸는 핵심 공장입니다.

## 아주 짧은 최종 요약

- `App()`은 화면을 고르는 총관리자입니다.
- `mountRoot()`는 App를 시작시키는 엔진 입구입니다.
- `FunctionComponent`는 hook과 렌더 상태를 기억합니다.
- `useState`는 상태를 `hooks` 배열에 저장합니다.
- 첫 화면 버튼을 누르면 `handleStart -> setAppState -> update -> App 재실행 -> NicknamePage 반환` 순서로 움직입니다.
- `createElement.js`는 VDOM 설계도를 실제 DOM으로 만드는 파일입니다.
- `||`는 "왼쪽이 부족하면 오른쪽 쓰기"입니다.
- `?.`는 "왼쪽이 있을 때만 다음으로 가기"입니다.
- SVG는 일반 HTML이 아니라 그림 전용 요소라서 따로 구분해서 만들어야 합니다.
