import { mountRoot } from "../engine/core/mountRoot.js";
import { useEffect } from "../engine/hooks/useEffect.js";
import { useMemo } from "../engine/hooks/useMemo.js";
import { useState } from "../engine/hooks/useState.js";
import { LoadingPage, NicknamePage, QuestionPage, ResultPage, StartPage } from "./components/pages.js";
import { quizConfig, quizQuestions, quizResults } from "./data/index.js";
import { evaluateQuizResult } from "./domain/quiz-logic.js";

function getSavedAnswer(answers, questionId) {
  return answers.find((answer) => answer.questionId === questionId) || null;
}

function upsertAnswer(answers, nextAnswer) {
  const index = answers.findIndex((answer) => answer.questionId === nextAnswer.questionId);
  if (index === -1) return [...answers, nextAnswer];

  const copied = [...answers];
  copied[index] = nextAnswer;
  return copied;
}

function App() {
  const [appState, setAppState] = useState({
    screen: "start",
    nickname: "",
    isNicknameComposing: false,
    currentIndex: 0,
    answers: [],
  });

  const calculated = useMemo(() => {
    return evaluateQuizResult({
      questions: quizQuestions,
      answers: appState.answers,
      axes: quizConfig.axes,
      results: quizResults,
    });
  }, [appState.answers]);

  const bestMatchResult = useMemo(() => {
    if (!calculated.result?.bestMatch) return null;
    return quizResults.find((item) => item.id === calculated.result.bestMatch) || null;
  }, [calculated.result]);

  useEffect(() => {
    if (appState.screen !== "loading") return undefined;

    const timeoutId = window.setTimeout(() => {
      setAppState((prev) => {
        if (prev.screen !== "loading") return prev;
        return {
          ...prev,
          screen: "result",
        };
      });
    }, 2000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [appState.screen]);

  const startConfig = {
    ...quizConfig,
    subtitle: quizConfig.subtitle || "정글 성향 테스트",
    ctaLabel: quizConfig.ctaLabel || "나는 어떤 정글 동물일까?",
  };

  const handleStart = () => {
    setAppState((prev) => ({
      ...prev,
      screen: "nickname",
    }));
  };

  const handleNicknameInput = (event) => {
    const nextNickname = event?.target?.value ?? "";
    setAppState((prev) => {
      if (prev.isNicknameComposing) return prev;
      return {
        ...prev,
        nickname: nextNickname,
      };
    });
  };

  const handleNicknameCompositionStart = () => {
    setAppState((prev) => ({
      ...prev,
      isNicknameComposing: true,
    }));
  };

  const handleNicknameCompositionEnd = (event) => {
    const nextNickname = event?.target?.value ?? "";
    setAppState((prev) => ({
      ...prev,
      nickname: nextNickname,
      isNicknameComposing: false,
    }));
  };

  const handleNicknameSubmit = () => {
    setAppState((prev) => {
      if (!prev.nickname.trim()) return prev;
      return {
        ...prev,
        screen: "quiz",
      };
    });
  };

  const handleChoiceSelect = (choice) => {
    setAppState((prev) => {
      const question = quizQuestions[prev.currentIndex];
      const nextAnswers = upsertAnswer(prev.answers, {
        questionId: question.id,
        axis: question.axis,
        choiceId: choice.id,
        score: choice.score,
      });
      const isLastQuestion = prev.currentIndex === quizQuestions.length - 1;

      return {
        ...prev,
        answers: nextAnswers,
        currentIndex: isLastQuestion ? prev.currentIndex : prev.currentIndex + 1,
      };
    });
  };

  const handlePrevQuestion = () => {
    setAppState((prev) => ({
      ...prev,
      currentIndex: Math.max(0, prev.currentIndex - 1),
    }));
  };

  const handleNextQuestion = () => {
    setAppState((prev) => ({
      ...prev,
      currentIndex: Math.min(quizQuestions.length - 1, prev.currentIndex + 1),
    }));
  };

  const handleFinishQuiz = () => {
    setAppState((prev) => {
      if (prev.answers.length !== quizQuestions.length) return prev;
      return {
        ...prev,
        screen: "loading",
      };
    });
  };

  const handleRestart = () => {
    setAppState({
      screen: "start",
      nickname: "",
      isNicknameComposing: false,
      currentIndex: 0,
      answers: [],
    });
  };

  if (appState.screen === "start") {
    return StartPage({
      config: startConfig,
      onStart: handleStart,
    });
  }

  if (appState.screen === "nickname") {
    return NicknamePage({
      nickname: appState.nickname,
      onInputNickname: handleNicknameInput,
      onSubmitNickname: handleNicknameSubmit,
      onNicknameCompositionStart: handleNicknameCompositionStart,
      onNicknameCompositionEnd: handleNicknameCompositionEnd,
    });
  }

  if (appState.screen === "quiz") {
    const currentQuestion = quizQuestions[appState.currentIndex];
    const savedAnswer = getSavedAnswer(appState.answers, currentQuestion.id);

    return QuestionPage({
      question: currentQuestion,
      questionIndex: appState.currentIndex,
      totalQuestions: quizQuestions.length,
      selectedChoiceId: savedAnswer?.choiceId || null,
      answeredCount: appState.answers.length,
      canGoPrev: appState.currentIndex > 0,
      canGoNext: appState.currentIndex < quizQuestions.length - 1 && Boolean(savedAnswer),
      canFinish: appState.answers.length === quizQuestions.length,
      onSelectChoice: handleChoiceSelect,
      onPrevQuestion: handlePrevQuestion,
      onNextQuestion: handleNextQuestion,
      onFinishQuiz: handleFinishQuiz,
    });
  }

  if (appState.screen === "loading") {
    return LoadingPage({
      nickname: appState.nickname,
    });
  }

  return ResultPage({
    nickname: appState.nickname,
    result: calculated.result,
    scores: calculated.scores,
    directions: calculated.directions,
    bestMatchResult,
    onRestart: handleRestart,
  });
}

export function mountApp() {
  const root = document.querySelector("#app");
  mountRoot(App, root);
}
