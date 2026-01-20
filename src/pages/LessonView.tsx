import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  Lightbulb,
  ExternalLink,
  Play,
  Brain,
  Sparkles,
  RotateCcw
} from "lucide-react";
import { getLessonById, LessonContent, Question, OPENWORM_RESOURCES } from "@/data/lessonContent";
import { useGameStore } from "@/stores/gameStore";
import { cn } from "@/lib/utils";
import { WormSimulator3D } from "@/components/WormSimulator3D";
import { WormBehavior } from "@/data/neuronData";

export default function LessonViewPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const { completedLessons, completeLesson, addXp, addPoints } = useGameStore();

  const [lesson, setLesson] = useState<LessonContent | null>(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [inQuiz, setInQuiz] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [submittedAnswers, setSubmittedAnswers] = useState<Record<string, boolean>>({});
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [wormBehavior, setWormBehavior] = useState<WormBehavior>("no_movement");

  useEffect(() => {
    if (lessonId) {
      const lessonData = getLessonById(lessonId);
      if (lessonData) {
        setLesson(lessonData);
      } else {
        navigate("/learn");
      }
    }
  }, [lessonId, navigate]);

  if (!lesson) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="loader" />
      </div>
    );
  }

  const isCompleted = completedLessons.includes(lesson.id);
  const totalSections = lesson.sections.length;
  const totalQuestions = lesson.questions.length;

  const handleSelectAnswer = (questionId: string, optionId: string) => {
    // Only allow changing if not yet submitted
    if (!submittedAnswers[questionId]) {
      setSelectedAnswers(prev => ({ ...prev, [questionId]: optionId }));
    }
  };

  const handleSubmitAnswer = (question: Question) => {
    const selected = selectedAnswers[question.id];
    if (!selected) return;

    // Prevent re-submitting
    if (submittedAnswers[question.id]) return;

    const isCorrect = selected === question.correctId;
    setSubmittedAnswers(prev => ({ ...prev, [question.id]: isCorrect }));

    if (isCorrect) {
      setEarnedPoints(prev => prev + question.points);
      // Animate worm on correct answer
      setWormBehavior("move_forward");
      setTimeout(() => setWormBehavior("no_movement"), 2000);
    } else {
      setWormBehavior("move_backward");
      setTimeout(() => setWormBehavior("no_movement"), 1500);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setShowResults(true);
      // Complete lesson if not already completed
      if (!isCompleted) {
        completeLesson(lesson.id);
        addXp(lesson.xp + earnedPoints);
        addPoints(earnedPoints * 2);
      }
    }
  };

  const handleRetryQuiz = () => {
    setSelectedAnswers({});
    setSubmittedAnswers({});
    setCurrentQuestion(0);
    setEarnedPoints(0);
    setShowResults(false);
  };

  const currentQ = lesson.questions[currentQuestion];
  const hasSubmittedCurrent = currentQ && submittedAnswers[currentQ.id] !== undefined;
  const canSubmitCurrent = currentQ && selectedAnswers[currentQ.id] && !hasSubmittedCurrent;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-5xl">
          {/* Back button */}
          <Link to="/learn">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Learning Path
            </Button>
          </Link>

          {/* Lesson Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <Badge variant="outline" className="font-mono">{lesson.module}</Badge>
              <Badge className="bg-primary">{lesson.duration}</Badge>
              <Badge variant="secondary">+{lesson.xp} XP</Badge>
              {isCompleted && (
                <Badge className="bg-accent">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Completed
                </Badge>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight">
              {lesson.title}
            </h1>
            <p className="text-muted-foreground mt-2">{lesson.description}</p>
          </motion.div>

          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="font-mono text-muted-foreground">
                {inQuiz ? `QUIZ ${currentQuestion + 1}/${totalQuestions}` : `SECTION ${currentSection + 1}/${totalSections}`}
              </span>
              <span className="font-bold text-primary">+{earnedPoints} pts earned</span>
            </div>
            <div className="h-3 bg-muted border-2 border-foreground overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-accent"
                initial={{ width: 0 }}
                animate={{ 
                  width: inQuiz 
                    ? `${((currentQuestion + (showResults ? 1 : 0)) / totalQuestions) * 100}%`
                    : `${((currentSection + 1) / (totalSections + 1)) * 100}%`
                }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main content */}
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                {!inQuiz ? (
                  /* SECTION VIEW */
                  <motion.div
                    key={`section-${currentSection}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-card border-2 border-foreground rounded-xl p-6 shadow-lg"
                  >
                    <h2 className="text-2xl font-bold mb-4">
                      {lesson.sections[currentSection].title}
                    </h2>
                    
                    {/* Content with proper formatting */}
                    <div className="prose prose-sm max-w-none">
                      {lesson.sections[currentSection].content.split('\n\n').map((para, i) => (
                        <p key={i} className="text-foreground mb-4 whitespace-pre-line">
                          {para}
                        </p>
                      ))}
                    </div>

                    {/* Video embed */}
                    {lesson.sections[currentSection].videoUrl && (
                      <div className="mt-6 aspect-video rounded-lg overflow-hidden border-2 border-foreground">
                        <iframe
                          src={lesson.sections[currentSection].videoUrl}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    )}

                    {/* Fun fact */}
                    {lesson.sections[currentSection].funFact && (
                      <div className="mt-6 p-4 bg-primary/10 border-2 border-primary rounded-lg">
                        <div className="flex items-start gap-3">
                          <Lightbulb className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold text-sm uppercase text-primary mb-1">Fun Fact</p>
                            <p className="text-sm">{lesson.sections[currentSection].funFact}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Navigation */}
                    <div className="flex justify-between mt-8">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentSection(prev => prev - 1)}
                        disabled={currentSection === 0}
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Previous
                      </Button>
                      
                      {currentSection < totalSections - 1 ? (
                        <Button onClick={() => setCurrentSection(prev => prev + 1)}>
                          Next Section
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      ) : (
                        <Button 
                          onClick={() => setInQuiz(true)}
                          className="bg-accent hover:bg-accent/90"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Start Quiz
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ) : showResults ? (
                  /* RESULTS VIEW */
                  <motion.div
                    key="results"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-card border-2 border-foreground rounded-xl p-8 shadow-lg text-center"
                  >
                    <Sparkles className="w-16 h-16 text-primary mx-auto mb-4" />
                    <h2 className="text-3xl font-black uppercase mb-4">
                      Quiz Complete!
                    </h2>
                    
                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="bg-muted rounded-lg p-4">
                        <p className="text-3xl font-bold text-primary">
                          {Object.values(submittedAnswers).filter(Boolean).length}/{totalQuestions}
                        </p>
                        <p className="text-sm text-muted-foreground">Correct Answers</p>
                      </div>
                      <div className="bg-muted rounded-lg p-4">
                        <p className="text-3xl font-bold text-accent">+{earnedPoints}</p>
                        <p className="text-sm text-muted-foreground">Points Earned</p>
                      </div>
                    </div>

                    <div className="bg-primary/10 border-2 border-primary rounded-lg p-4 mb-8">
                      <Brain className="w-8 h-8 text-primary mx-auto mb-2" />
                      <p className="font-bold text-primary mb-1">OpenWorm Connection</p>
                      <p className="text-sm">{lesson.openWormConnection}</p>
                    </div>

                    <div className="flex gap-4 justify-center">
                      <Button variant="outline" onClick={handleRetryQuiz}>
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Retry Quiz
                      </Button>
                      <Link to="/learn">
                        <Button>
                          Continue Learning
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </motion.div>
                ) : (
                  /* QUIZ VIEW */
                  <motion.div
                    key={`question-${currentQuestion}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-card border-2 border-foreground rounded-xl p-6 shadow-lg"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant="outline" className="font-mono">
                        Question {currentQuestion + 1} of {totalQuestions}
                      </Badge>
                      <Badge className="bg-primary">+{currentQ.points} pts</Badge>
                    </div>

                    <h3 className="text-xl font-bold mb-6">{currentQ.text}</h3>

                    {/* Answer options */}
                    <div className="space-y-3 mb-6">
                      {currentQ.options.map((option) => {
                        const isSelected = selectedAnswers[currentQ.id] === option.id;
                        const hasSubmitted = submittedAnswers[currentQ.id] !== undefined;
                        const isCorrect = option.id === currentQ.correctId;
                        const wasWrong = hasSubmitted && isSelected && !isCorrect;
                        const showCorrect = hasSubmitted && isCorrect;

                        return (
                          <button
                            key={option.id}
                            onClick={() => handleSelectAnswer(currentQ.id, option.id)}
                            disabled={hasSubmitted}
                            className={cn(
                              "w-full p-4 rounded-lg border-2 text-left transition-all",
                              "hover:border-primary hover:bg-primary/5",
                              isSelected && !hasSubmitted && "border-primary bg-primary/10",
                              showCorrect && "border-accent bg-accent/10",
                              wasWrong && "border-destructive bg-destructive/10",
                              !isSelected && !hasSubmitted && "border-muted-foreground/30",
                              hasSubmitted && !isCorrect && !isSelected && "opacity-50"
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{option.text}</span>
                              {showCorrect && <CheckCircle2 className="w-5 h-5 text-accent" />}
                              {wasWrong && <XCircle className="w-5 h-5 text-destructive" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Explanation (after submit) */}
                    {hasSubmittedCurrent && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          "p-4 rounded-lg border-2 mb-6",
                          submittedAnswers[currentQ.id] 
                            ? "bg-accent/10 border-accent" 
                            : "bg-destructive/10 border-destructive"
                        )}
                      >
                        <p className="font-bold mb-1">
                          {submittedAnswers[currentQ.id] ? "🎉 Correct!" : "❌ Not quite!"}
                        </p>
                        <p className="text-sm">{currentQ.explanation}</p>
                      </motion.div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-between">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                        disabled={currentQuestion === 0}
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Previous
                      </Button>

                      {!hasSubmittedCurrent ? (
                        <Button 
                          onClick={() => handleSubmitAnswer(currentQ)}
                          disabled={!canSubmitCurrent}
                        >
                          Submit Answer
                        </Button>
                      ) : (
                        <Button onClick={handleNextQuestion}>
                          {currentQuestion < totalQuestions - 1 ? "Next Question" : "See Results"}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Worm visualization */}
              <div className="bg-card border-2 border-foreground rounded-xl p-4 shadow-lg">
                <h3 className="font-bold text-sm uppercase mb-3 flex items-center gap-2">
                  <Brain className="w-4 h-4 text-primary" />
                  Live Worm
                </h3>
                <WormSimulator3D
                  behavior={wormBehavior}
                  activeNeurons={[]}
                  signalPath={[]}
                  isSimulating={wormBehavior !== "no_movement"}
                />
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Watch me react to your answers!
                </p>
              </div>

              {/* OpenWorm Resources */}
              <div className="bg-card border-2 border-foreground rounded-xl p-4 shadow-lg">
                <h3 className="font-bold text-sm uppercase mb-3">
                  🔬 OpenWorm Resources
                </h3>
                <div className="space-y-2 text-sm">
                  <a 
                    href={OPENWORM_RESOURCES.github} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:text-primary transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    GitHub Repository
                  </a>
                  <a 
                    href={OPENWORM_RESOURCES.c302} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:text-primary transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    c302 Neural Model
                  </a>
                  <a 
                    href={OPENWORM_RESOURCES.sibernetic} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:text-primary transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Sibernetic Simulator
                  </a>
                  <a 
                    href={OPENWORM_RESOURCES.wormAtlas} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:text-primary transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    WormAtlas Database
                  </a>
                </div>
              </div>

              {/* Section navigation */}
              {!inQuiz && (
                <div className="bg-card border-2 border-foreground rounded-xl p-4 shadow-lg">
                  <h3 className="font-bold text-sm uppercase mb-3">Sections</h3>
                  <div className="space-y-2">
                    {lesson.sections.map((section, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentSection(i)}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-lg text-sm transition-all",
                          i === currentSection 
                            ? "bg-primary text-primary-foreground" 
                            : "hover:bg-muted"
                        )}
                      >
                        {i + 1}. {section.title}
                      </button>
                    ))}
                    <button
                      onClick={() => setInQuiz(true)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg text-sm transition-all",
                        inQuiz ? "bg-accent text-accent-foreground" : "hover:bg-muted"
                      )}
                    >
                      📝 Quiz ({totalQuestions} questions)
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
