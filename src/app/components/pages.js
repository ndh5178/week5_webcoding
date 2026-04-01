import { h } from "../../engine/vdom/h.js";

function AppShell({ children, screenClassName = "", screenTag = "section" }) {
  const screenClass = screenClassName ? `screen ${screenClassName}` : "screen";
  return h(
    "main",
    { className: "app-shell" },
    h(
      screenTag,
      { className: screenClass },
      h("div", { className: "screen-surface" }, children)
    )
  );
}

function HeaderLogo() {
  return h("div", { className: "logo" }, "JUNGLE TEST");
}

function PrimaryButton({ label, onClick, disabled, block = false, className = "", suffix = "" }) {
  return h(
    "button",
    {
      className: `primary-button${block ? " block" : ""}${className ? ` ${className}` : ""}`,
      onClick,
      disabled,
      type: "button",
    },
    h("span", { className: "primary-button-label" }, label),
    suffix ? h("span", { className: "primary-button-suffix", "aria-hidden": "true" }, suffix) : null
  );
}

export function StartPage({ config, onStart }) {
  const visual = h(
    "div",
    { className: "start-visual" },
    h("div", { className: "start-visual-glow" }),
    h(
      "div",
      { className: "start-code-card" },
      h(
        "div",
        { className: "start-code-dots" },
        h("span", { className: "start-code-dot start-code-dot-red" }),
        h("span", { className: "start-code-dot start-code-dot-yellow" }),
        h("span", { className: "start-code-dot start-code-dot-green" })
      ),
      h("code", { className: "start-code-text" }, 'git commit -m "wild"')
    ),
    h(
      "div",
      { className: "start-illustration-frame" },
      h("img", {
        className: "start-illustration",
        src: "/src/app/assets/imgs/hidden.png",
        alt: "궁금증 유발하는 메인 사진",
      })
    ),
    h("div", { className: "start-level-badge" }, "LV. 99 DEV")
  );

  const copy = h(
    "div",
    { className: "start-copy" },
    h("p", { className: "start-kicker" }, config.subtitle),
    h("h1", { className: "start-headline" }, "당신은 정글에서", h("br"), "어떤 동물입니까?"),
    h("p", { className: "page-description start-description" }, config.description),
    h(
      "div",
      { className: "start-actions" },
      PrimaryButton({
        label: config.ctaLabel,
        onClick: onStart,
        block: true,
        className: "start-cta",
        suffix: "->",
      }),
      h("p", { className: "start-meta" }, "예상 소요 시간 · 3분")
    )
  );

  return AppShell({
    screenClassName: "screen-start",
    children: [
      HeaderLogo(),
      h("div", { className: "start-hero" }, visual, copy),
    ],
  });
}

export function NicknamePage({
  nickname,
  onInputNickname,
  onSubmitNickname,
  onNicknameCompositionStart,
  onNicknameCompositionEnd,
}) {
  const isValid = nickname.trim().length > 0;

  return AppShell({
    children: [
      h("h2", { className: "question-title" }, "이름(닉네임)이 무엇인가요?"),
      h("label", { className: "field-wrap" },
        h("input", {
          className: "nickname-input",
          type: "text",
          placeholder: "닉네임 입력",
          value: nickname,
          maxLength: 16,
          onInput: onInputNickname,
          onCompositionStart: onNicknameCompositionStart,
          onCompositionEnd: onNicknameCompositionEnd,
          onKeydown: (event) => {
            if (event.isComposing) return;
            if (event.key === "Enter") onSubmitNickname();
          },
        })
      ),
      PrimaryButton({
        label: "다음으로",
        onClick: onSubmitNickname,
        disabled: !isValid,
      }),
    ],
  });
}

function ProgressBar({ current, total }) {
  const progress = total > 0 ? Math.floor((current / total) * 100) : 0;

  return h(
    "div",
    { className: "progress-wrap" },
    h("span", { className: "progress-label" }, `${current}/${total}`),
    h("div", { className: "progress-track" },
      h("div", {
        className: "progress-fill",
        style: `width: ${progress}%;`,
      })
    )
  );
}

function ChoiceButton({ choice, onSelect, selected }) {
  return h(
    "button",
    {
      className: `choice-button${selected ? " selected" : ""}`,
      onClick: () => onSelect(choice),
      type: "button",
    },
    choice.text
  );
}

function getAxisSpec(score, positiveLabel, negativeLabel) {
  const safeScore = Math.max(-4, Math.min(4, score || 0));
  const isPositive = safeScore > 0;
  const positivePercent = Math.round(((safeScore + 4) / 8) * 100);
  const negativePercent = 100 - positivePercent;
  const dominantSide = positivePercent >= negativePercent ? "positive" : "negative";
  const dominantValue = dominantSide === "positive" ? positivePercent : negativePercent;

  return {
    direction: isPositive ? "positive" : "negative",
    label: isPositive ? positiveLabel : negativeLabel,
    positiveLabel,
    negativeLabel,
    positivePercent,
    negativePercent,
    dominantSide,
    dominantValue,
    score: safeScore,
  };
}

function RadarGraph({ scores, axes }) {
  const axisColors = {
    CT: "tech-spec-bar-blue",
    TL: "tech-spec-bar-gold",
    PL: "tech-spec-bar-green",
    AI: "tech-spec-bar-purple",
  };
  const axisTitles = {
    CT: "협업 방식",
    TL: "학습 방식",
    PL: "진행 방식",
    AI: "도구 활용 방식",
  };

  const axisItems = (axes || []).map((axis, index) => {
    const axisSpec = getAxisSpec(scores?.[axis.id], axis.labelPositive, axis.labelNegative);
    const fillStyle =
      axisSpec.dominantSide === "positive"
        ? `left: 0; width: ${axisSpec.positivePercent}%;`
        : `right: 0; width: ${axisSpec.negativePercent}%;`;

    return h(
      "article",
      {
        className: `tech-spec-item${index < axes.length - 1 ? " with-divider" : ""}`,
      },
      h("h3", { className: "tech-spec-title" }, axisTitles[axis.id] || axis.id),
      h(
        "div",
        { className: "tech-spec-values" },
        h(
          "div",
          { className: "tech-spec-side tech-spec-side-left" },
          h("strong", { className: "tech-spec-percent" }, `${axisSpec.positivePercent}%`),
          h("span", { className: "tech-spec-label" }, axisSpec.positiveLabel)
        ),
        h(
          "div",
          { className: "tech-spec-track-wrap" },
          h(
            "div",
            { className: "tech-spec-track" },
            h("div", {
              className: `tech-spec-fill ${axisColors[axis.id] || "tech-spec-bar-blue"}`,
              style: fillStyle,
            })
          )
        ),
        h(
          "div",
          { className: "tech-spec-side tech-spec-side-right" },
          h("strong", { className: "tech-spec-percent" }, `${axisSpec.negativePercent}%`),
          h("span", { className: "tech-spec-label" }, axisSpec.negativeLabel)
        )
      )
    );
  });

  return h(
    "section",
    { className: "radar-card" },
    h("p", { className: "result-section-label" }, "TECH_SPECS"),
    h("div", { className: "tech-spec-list" }, axisItems)
  );
}

function ResultHero({ result }) {
  const hasImage = Boolean(result?.image);

  return h(
    "section",
    { className: "result-hero" },
    hasImage
      ? h("img", {
          className: "result-image",
          src: result.image,
          alt: result?.animal || "결과 동물 이미지",
        })
      : h(
          "div",
          { className: "result-image result-image-placeholder" },
          h("span", { className: "result-image-animal" }, result?.animal || "정글 동물"),
          h("span", { className: "result-image-copy" }, result?.reason || "DEMO IMAGE SLOT")
        ),
    h("p", { className: "result-section-label" }, "TYPE"),
    h("p", { className: "result-hero-title" }, result?.title || "결과 준비 중")
  );
}

function BestSynergy({ bestMatchResult }) {
  return h(
    "section",
    { className: "synergy-card" },
    h("p", { className: "result-section-label" }, "BEST_SYNERGY"),
    h(
      "div",
      { className: "synergy-row" },
      h("div", { className: "synergy-icon" }, bestMatchResult?.animal?.split(" ")[0] || "?"),
      h(
        "div",
        { className: "synergy-copy" },
        h("strong", { className: "synergy-name" }, bestMatchResult?.title || "궁합 동물 준비 중"),
        h("p", { className: "synergy-description" }, bestMatchResult?.reason || "가장 잘 맞는 동물 정보를 여기에 표시합니다.")
      )
    )
  );
}

function ResultDescriptionCard({ result }) {
  return h(
    "article",
    { className: "result-card" },
    h("p", { className: "result-section-label" }, "PROFILE"),
    h("p", { className: "result-animal" }, result?.animal || "결과 준비 중"),
    h("h2", { className: "result-title" }, result?.title || "아직 매칭되는 결과가 없어요"),
    h("p", { className: "result-description" }, result?.description || "데이터를 확인해 주세요.")
  );
}

function ResultStrengthCard({ strengths }) {
  const summary = (strengths || []).join(", ") || "강점 정보 준비 중";

  return h(
    "section",
    { className: "insight-card insight-card-positive" },
    h("div", { className: "insight-icon" }, "⚡"),
    h(
      "div",
      { className: "insight-copy" },
      h("strong", { className: "insight-title" }, "강점"),
      h("p", { className: "insight-description" }, summary)
    )
  );
}

function ResultCautionCard({ caution }) {
  return h(
    "section",
    { className: "insight-card insight-card-caution" },
    h("div", { className: "insight-icon" }, "!"),
    h(
      "div",
      { className: "insight-copy" },
      h("strong", { className: "insight-title" }, "주의점"),
      h("p", { className: "insight-description" }, caution || "보완점 정보 준비 중")
    )
  );
}

export function QuestionPage({
  question,
  questionIndex,
  totalQuestions,
  selectedChoiceId,
  answeredCount,
  canGoPrev,
  canGoNext,
  canFinish,
  onSelectChoice,
  onPrevQuestion,
  onNextQuestion,
  onFinishQuiz,
}) {
  return AppShell({
    children: [
      ProgressBar({
        current: questionIndex + 1,
        total: totalQuestions,
      }),
      h("p", { className: "saved-status" }, `저장됨 ${answeredCount}/${totalQuestions}`),
      h("h2", { className: "question-title question-title-fixed" }, question.text),
      h(
        "div",
        { className: "choice-list" },
        question.choices.map((choice) =>
          ChoiceButton({
            choice,
            onSelect: onSelectChoice,
            selected: selectedChoiceId === choice.id,
          })
        )
      ),
      h(
        "div",
        { className: "question-nav" },
        h(
          "div",
          { className: "question-nav-row" },
          h(
            "button",
            {
              className: "nav-button",
              type: "button",
              onClick: onPrevQuestion,
              disabled: !canGoPrev,
            },
            "이전"
          ),
          h(
            "button",
            {
              className: "nav-button",
              type: "button",
              onClick: onNextQuestion,
              disabled: !canGoNext,
            },
            "다음"
          )
        ),
        h(
          "button",
          {
            className: "nav-button nav-finish nav-finish-full",
            type: "button",
            onClick: onFinishQuiz,
            disabled: !canFinish,
          },
          "결과 보기"
        )
      ),
    ],
  });
}

export function LoadingPage({ nickname }) {
  return AppShell({
    screenClassName: "screen-loading",
    children: [
      h(
        "div",
        { className: "loading-panel" },
        h(
          "section",
          { className: "loading-content" },
          h(
            "div",
            { className: "loading-visual" },
            h("div", { className: "loading-ring loading-ring-outer" }),
            h(
              "div",
              { className: "loading-core" },
              h(
                "div",
                { className: "loading-core-body" },
                h("p", { className: "loading-core-text" }, "loading...")
              )
            )
          ),
          h(
            "div",
            { className: "loading-copy" },
            h(
              "h2",
              { className: "loading-title" },
              nickname ? `${nickname}님의 정글 동물을` : "당신의 정글 동물을",
              h("br"),
              "찾고 있습니다...",
              h("span", { className: "loading-cursor", "aria-hidden": "true" })
            )
          ),
          h(
            "div",
            { className: "loading-progress" },
            h(
              "div",
              { className: "loading-progress-track" },
              h("div", { className: "loading-progress-fill" })
            )
          )
        )
      ),
    ],
  });
}

export function ResultPage({ nickname, result, scores, directions, bestMatchResult, onRestart }) {
  return AppShell({
    screenClassName: "screen-result",
    screenTag: "article",
    children: [
      HeaderLogo(),
      h("h1", { className: "page-title" }, "정글 성향 테스트 결과"),
      h(
        "div",
        { className: "result-content" },
        ResultHero({ result }),
        ResultDescriptionCard({ result }),
        ResultStrengthCard({ strengths: result?.strengths }),
        ResultCautionCard({ caution: result?.caution }),
        RadarGraph({
          scores,
          axes: [
            { id: "CT", labelPositive: "협업", labelNegative: "독립" },
            { id: "TL", labelPositive: "이론", labelNegative: "실전" },
            { id: "PL", labelPositive: "계획", labelNegative: "즉흥" },
            { id: "AI", labelPositive: "AI의존", labelNegative: "AI참고" },
          ],
        }),
        BestSynergy({ bestMatchResult })
      ),
      h(
        "footer",
        { className: "result-actions" },
        PrimaryButton({
          label: "다시하기",
          onClick: onRestart,
        })
      ),
    ],
  });
}
