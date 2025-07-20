"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { Plus, Save, Globe, Lock, ArrowLeft } from "lucide-react";
import SortableQuestion from "../../components/sortable-question";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { quizService } from "@/features/quiz/quiz.service";
import Link from "next/link";

// Types

type Question = {
  id: string;
  question: string;
  options: string[];
  answer: string;
  points: number;
  _id?: string;
};



export default function EditQuizPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params?.quizId as string;
  const queryClient = useQueryClient();

  // Form state
  const [quizTitle, setQuizTitle] = useState("");
  const [quizInstructions, setQuizInstructions] = useState("");
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [passingScore, setPassingScore] = useState(70);
  const [duration, setDuration] = useState("15 minutes");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [activeTab, setActiveTab] = useState<'basic' | 'questions'>('basic');
  const [isPublic, setIsPublic] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [code, setCode] = useState("");
  const [initialized, setInitialized] = useState(false);

  const buildQuizData = () => {
    const maxScore = questions.reduce((total, q) => total + q.points, 0);
    const xpReward = Math.floor(maxScore * 0.5);
    return {
      title: quizTitle,
      instruction: quizInstructions,
      passingScore,
      maxScore,
      xpReward,
      subject,
      topic,
      duration,
      isPublic,
      code,
      questions: questions.map((q: Question) => ({
        id: q.id,
        question: q.question,
        options: q.options,
        answer: q.answer,
        points: q.points,
      })),
    };
  };
  // Fetch quiz data
  const fetchQuizData = useCallback(async () => {
    try {
      const quiz = await quizService.getQuizById(quizId);
      setQuizTitle(quiz.title);
      setQuizInstructions(quiz.instruction);
      setSubject(quiz.subject);
      setTopic(quiz.topic);
      setPassingScore(quiz.passingScore);
      setDuration(quiz.duration);
      setIsPublic(quiz.isPublic);
      setCode(quiz.code);

      const formattedQuestions = quiz.questions.map((q) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const id = ((q as any).id ?? (q as any)._id ?? `q-${Math.random()}`).toString();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const points = typeof (q as any).points === 'number' ? (q as any).points : 1;
        return {
          id,
          question: q.question,
          options: q.options,
          answer: q.answer,
          points,
        };
      });
      setQuestions(formattedQuestions);
    } catch {
      toast.error("Erreur lors du chargement du quiz");
    } finally {
      setIsLoading(false);
    }
  }, [quizId]);

  useEffect(() => {
    if (!initialized) {
      fetchQuizData().then(() => setInitialized(true));
    }
  }, [fetchQuizData, initialized]);

  // dnd-kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const addQuestion = () => {
    const newQuestion: Question = {
      id: `question-${Date.now()}`,
      question: "Nouvelle question",
      options: ["Option 1", "Option 2"],
      answer: "Option 1",
      points: 1,
    };
    setQuestions([...questions, newQuestion]);
  };

  const deleteQuestion = (idx: number) => {
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const editQuestion = (idx: number, updated: Question) => {
    setQuestions(questions.map((q, i) => (i === idx ? updated : q)));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setQuestions((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        if (oldIndex === -1 || newIndex === -1) return items;
        const newItems = [...items];
        const [removed] = newItems.splice(oldIndex, 1);
        newItems.splice(newIndex, 0, removed);
        return newItems;
      });
    }
  };

  const validateForm = () => {
    if (!quizTitle) return "Titre requis";
    if (!quizInstructions) return "Instructions requises";
    if (!subject) return "Sujet requis";
    if (!topic) return "Thème requis";
    if (passingScore < 0 || passingScore > 100) return "Score entre 0 et 100";
    if (questions.length === 0) return "Ajoutez au moins une question";
    for (const question of questions) {
      if (!question.question) return "Chaque question doit avoir un texte";
      if (question.options.length < 2) return "Chaque question doit avoir au moins 2 options";
      if (!question.options.includes(question.answer)) return "La bonne réponse doit être une des options";
    }
    return null;
  };

  const updateQuizMutation = useMutation({
    mutationFn: async (quizData: ReturnType<typeof buildQuizData>) => {
      return quizService.update(quizId, quizData);
    },
    onSuccess: () => {
      toast.success("Quiz mis à jour !");
      queryClient.invalidateQueries({ queryKey: ["my-quizzes"] });
      router.push("/dashboard/my-quizzes");
    },
    onError: (error: unknown) => {
      let errorMessage = "Erreur lors de la mise à jour";
      if (error instanceof Error) errorMessage = error.message;
      toast.error(errorMessage);
    },
  });

  const saveQuiz = () => {
    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }
    const quizData = buildQuizData();
    toast.info("Mise à jour du quiz...");
    updateQuizMutation.mutate(quizData);
  };

  if (isLoading) {
    return (
      <div className="mx-auto px-4 md:px-6 py-8 md:py-12 max-w-6xl container">
        <div className="flex justify-center items-center h-64">
          <div className="border-red-500 border-t-2 border-b-2 rounded-full w-12 h-12 animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl container">
      <div className="mb-6">
        <Link href="/dashboard/my-quizzes" className="inline-flex items-center text-red-500 hover:text-red-600 transition-colors">
          <ArrowLeft className="mr-2 w-4 h-4" /> Retour à mes quiz
        </Link>
      </div>
      <div className="bg-white shadow-md border border-red-100 rounded-xl overflow-hidden">
        <div className="p-6 border-red-100 border-b">
          <div className="flex md:flex-row flex-col justify-between md:items-center gap-4">
            <div>
              <h2 className="font-bold text-gray-800 text-2xl">Modifier le quiz</h2>
              <p className="mt-1 text-gray-500">Mettez à jour les détails et questions du quiz.</p>
            </div>
            <div className="flex sm:flex-row flex-col items-center gap-3">
              <button
                type="button"
                onClick={() => setIsPublic(!isPublic)}
                className={`inline-flex items-center justify-center rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${isPublic ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-orange-100 text-orange-700 hover:bg-orange-200"}`}
              >
                {isPublic ? (
                  <><Globe className="mr-1 w-4 h-4" /> Public</>
                ) : (
                  <><Lock className="mr-1 w-4 h-4" /> Privé</>
                )}
              </button>
            </div>
          </div>
        </div>
        <div className="flex border-red-100 border-b">
          <button
            className={`flex-1 px-4 py-3 text-center font-medium ${activeTab === "basic" ? "border-b-2 border-red-500 text-red-500" : "text-gray-500 hover:text-red-500"} transition-colors`}
            onClick={() => setActiveTab('basic')}
            type="button"
          >
            Infos de base
          </button>
          <button
            className={`flex-1 px-4 py-3 text-center font-medium ${activeTab === "questions" ? "border-b-2 border-red-500 text-red-500" : "text-gray-500 hover:text-red-500"} transition-colors`}
            onClick={() => setActiveTab('questions')}
            type="button"
          >
            Questions
          </button>
        </div>
        <div className="p-6">
          {activeTab === 'basic' ? (
            <div className="space-y-6">
              <div className="gap-4 grid md:grid-cols-2">
                <div className="space-y-2">
                  <label className="block font-medium text-gray-700 text-sm">Titre du quiz</label>
                  <input type="text" className="p-2 border border-gray-300 focus:border-red-500 rounded-lg w-full" value={quizTitle} onChange={e => setQuizTitle(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="block font-medium text-gray-700 text-sm">Score de réussite (%)</label>
                  <input type="number" className="p-2 border border-gray-300 focus:border-red-500 rounded-lg w-full" value={passingScore} onChange={e => setPassingScore(Number(e.target.value))} />
                </div>
              </div>
              <div className="gap-4 grid md:grid-cols-2">
                <div className="space-y-2">
                  <label className="block font-medium text-gray-700 text-sm">Sujet</label>
                  <input type="text" className="p-2 border border-gray-300 focus:border-red-500 rounded-lg w-full" value={subject} onChange={e => setSubject(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="block font-medium text-gray-700 text-sm">Thème</label>
                  <input type="text" className="p-2 border border-gray-300 focus:border-red-500 rounded-lg w-full" value={topic} onChange={e => setTopic(e.target.value)} />
                </div>
              </div>
              <div className="gap-4 grid md:grid-cols-2">
                <div className="space-y-2">
                  <label className="block font-medium text-gray-700 text-sm">Durée</label>
                  <select className="p-2 border border-gray-300 focus:border-red-500 rounded-lg w-full" value={duration} onChange={e => setDuration(e.target.value)}>
                    <option value='10 minutes'>10 minutes</option>
                    <option value='15 minutes'>15 minutes</option>
                    <option value='20 minutes'>20 minutes</option>
                    <option value='30 minutes'>30 minutes</option>
                    <option value='45 minutes'>45 minutes</option>
                    <option value='60 minutes'>60 minutes</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block font-medium text-gray-700 text-sm">Code du quiz</label>
                  <input type="text" className="bg-gray-50 p-2 border border-gray-300 rounded-lg w-full" value={code} disabled readOnly />
                  <p className="text-gray-500 text-xs">Le code du quiz ne peut pas être modifié</p>
                </div>
              </div>
              <div className="space-y-2">
                <label className="block font-medium text-gray-700 text-sm">Instructions</label>
                <textarea className="p-2 border border-gray-300 focus:border-red-500 rounded-lg w-full" value={quizInstructions} onChange={e => setQuizInstructions(e.target.value)} rows={4} />
              </div>
              <div className="flex justify-end">
                <button type="button" onClick={() => setActiveTab('questions')} className="inline-flex justify-center items-center bg-red-500 hover:bg-red-600 px-6 py-2 rounded-full font-medium text-white transition-colors">Suivant : Questions</button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-lg">Questions</h3>
                <button type="button" onClick={addQuestion} className="inline-flex justify-center items-center bg-red-500 hover:bg-red-600 px-4 py-2 rounded-full font-medium text-white transition-colors"><Plus className="mr-1 w-4 h-4" /> Ajouter une question</button>
              </div>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
                modifiers={[restrictToVerticalAxis]}
              >
                <SortableContext
                  items={questions.map((q) => q.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {questions.map((field, idx) => (
                    <SortableQuestion
                      key={field.id}
                      field={field}
                      index={idx}
                      update={editQuestion}
                      remove={deleteQuestion}
                    />
                  ))}
                </SortableContext>
              </DndContext>
              {questions.length === 0 && (
                <div className="py-8 text-center">
                  <p className="text-gray-500">Aucune question ajoutée. Cliquez sur &quot;Ajouter une question&quot;.</p>
                </div>
              )}
              <div className="flex justify-end">
                <button type="button" onClick={saveQuiz} disabled={updateQuizMutation.isPending} className={`inline-flex justify-center items-center bg-red-500 hover:bg-red-600 px-6 py-2 rounded-full font-medium text-white transition-colors ${updateQuizMutation.isPending ? 'opacity-70 cursor-not-allowed' : ''}`}>
                  {updateQuizMutation.isPending ? (
                    <>
                      <svg className="mr-2 -ml-1 w-4 h-4 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      Sauvegarde...
                    </>
                  ) : (
                    <><Save className="mr-1 w-4 h-4" /> Sauvegarder le quiz</>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
