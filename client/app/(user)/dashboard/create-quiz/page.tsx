"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { useState } from "react";
import { Plus, Save, Globe, Lock } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { quizService } from "@/features/quiz/quiz.service";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import SortableQuestion from "../components/sortable-question";
import { useRouter } from "next/navigation";
interface QuizFormValues {
  title: string;
  instruction: string;
  subject: string;
  topic: string;
  passingScore: number;
  duration: string;
  isPublic: boolean;
  questions: {
    id: string;
    question: string;
    options: string[];
    answer: string;
    points: number;
  }[];
}

export default function CreateQuizPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'basic' | 'questions'>('basic');

  const { control, register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<QuizFormValues>({
    defaultValues: {
      title: '',
      instruction: '',
      subject: '',
      topic: '',
      passingScore: 70,
      duration: '15 minutes',
      isPublic: true,
      questions: [],
    },
  });

  const { fields, append, remove, move, update } = useFieldArray({
    control,
    name: 'questions',
  });

  // dnd-kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Drag & drop handler
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = fields.findIndex((item) => item.id === active.id);
      const newIndex = fields.findIndex((item) => item.id === over?.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        move(oldIndex, newIndex);
      }
    }
  };

  const createQuizMutation = useMutation({
    mutationFn: async (data: QuizFormValues) => {
      // Parse les champs numériques
      const passingScore = Number(data.passingScore);
      const maxScore = data.questions.reduce((acc, q) => acc + Number(q.points || 1), 0);
      const xpReward = Math.floor(maxScore * 0.5);
      return quizService.create({
        ...data,
        passingScore,
        maxScore,
        xpReward,
      });
    },
    onSuccess: () => {
      toast.success('Quiz créé avec succès !');
      queryClient.invalidateQueries({ queryKey: ['my-quizzes'] });
    },
    onError: (err: unknown) => {
      const message =
        err && typeof err === "object" && err !== null && "message" in err && typeof (err as { message?: unknown }).message === "string"
          ? (err as { message: string }).message
          : "Erreur lors de la création du quiz";
      toast.error(message);
    },
  });

  const onSubmit = (data: QuizFormValues) => {
    if (data.questions.length === 0) {
      toast.error('Ajoutez au moins une question');
      return;
    }
    createQuizMutation.mutate(data);
    router.push("/dashboard/my-quizzes");
  };

  return (
    <div className="mx-auto max-w-6xl container">
      <div className="bg-white shadow-md border border-red-100 rounded-xl overflow-hidden">
        <div className="p-6 border-red-100 border-b">
          <div className="flex md:flex-row flex-col justify-between md:items-center gap-4">
            <div>
              <h2 className="font-bold text-gray-800 text-2xl">Créer un nouveau quiz</h2>
              <p className="mt-1 text-gray-500">Concevez votre quiz avec une gestion dynamique des questions.</p>
            </div>
            <div className="flex sm:flex-row flex-col items-center gap-3">
              <button
                type="button"
                onClick={() => setValue('isPublic', !watch('isPublic'))}
                className={`inline-flex items-center justify-center rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${watch('isPublic') ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-orange-100 text-orange-700 hover:bg-orange-200"}`}
              >
                {watch('isPublic') ? (
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
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-6">
            {activeTab === 'basic' ? (
              <div className="space-y-6">
                <div className="gap-4 grid md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="block font-medium text-gray-700 text-sm">Titre du quiz</label>
                    <input type="text" className="p-2 border border-gray-300 focus:border-red-500 rounded-lg w-full" {...register('title', { required: true })} />
                    {errors.title && <span className="text-red-500 text-xs">Titre requis</span>}
                  </div>
                  <div className="space-y-2">
                    <label className="block font-medium text-gray-700 text-sm">Score de réussite (%)</label>
                    <input type="number" className="p-2 border border-gray-300 focus:border-red-500 rounded-lg w-full" {...register('passingScore', { required: true, min: 0, max: 100 })} />
                    {errors.passingScore && <span className="text-red-500 text-xs">Score entre 0 et 100</span>}
                  </div>
                </div>
                <div className="gap-4 grid md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="block font-medium text-gray-700 text-sm">Sujet</label>
                    <input type="text" className="p-2 border border-gray-300 focus:border-red-500 rounded-lg w-full" {...register('subject', { required: true })} />
                    {errors.subject && <span className="text-red-500 text-xs">Sujet requis</span>}
                  </div>
                  <div className="space-y-2">
                    <label className="block font-medium text-gray-700 text-sm">Thème</label>
                    <input type="text" className="p-2 border border-gray-300 focus:border-red-500 rounded-lg w-full" {...register('topic', { required: true })} />
                    {errors.topic && <span className="text-red-500 text-xs">Thème requis</span>}
                  </div>
                </div>
                <div className="gap-4 grid md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="block font-medium text-gray-700 text-sm">Durée</label>
                    <select className="p-2 border border-gray-300 focus:border-red-500 rounded-lg w-full" {...register('duration', { required: true })}>
                      <option value='10 minutes'>10 minutes</option>
                      <option value='15 minutes'>15 minutes</option>
                      <option value='20 minutes'>20 minutes</option>
                      <option value='30 minutes'>30 minutes</option>
                      <option value='45 minutes'>45 minutes</option>
                      <option value='60 minutes'>60 minutes</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block font-medium text-gray-700 text-sm">Instructions</label>
                  <textarea className="p-2 border border-gray-300 focus:border-red-500 rounded-lg w-full" rows={4} {...register('instruction', { required: true })} />
                  {errors.instruction && <span className="text-red-500 text-xs">Instructions requises</span>}
                </div>
                <div className="flex justify-end">
                  <button type="button" onClick={() => setActiveTab('questions')} className="inline-flex justify-center items-center bg-red-500 hover:bg-red-600 px-6 py-2 rounded-full font-medium text-white transition-colors">Suivant : Questions</button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-lg">Questions</h3>
                  <button type="button" onClick={() => append({ question: '', options: ['', ''], answer: '', points: 1 })} className="inline-flex justify-center items-center bg-red-500 hover:bg-red-600 px-4 py-2 rounded-full font-medium text-white transition-colors"><Plus className="mr-1 w-4 h-4" /> Ajouter une question</button>
                </div>
                {fields.length === 0 && (
                  <div className="py-8 text-center">
                    <p className="text-gray-500">Aucune question ajoutée. Cliquez sur {"Ajouter une question."}</p>
                  </div>
                )}
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                  modifiers={[restrictToVerticalAxis]}
                >
                  <SortableContext
                    items={fields.map((q) => q.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {fields.map((field, idx) => (
                      <SortableQuestion
                        key={field.id}
                        field={field}
                        index={idx}
                        update={update}
                        remove={remove}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
                <div className="flex justify-end">
                  <button type="submit" disabled={isSubmitting || createQuizMutation.isPending} className={`inline-flex justify-center items-center bg-red-500 hover:bg-red-600 px-6 py-2 rounded-full font-medium text-white transition-colors ${isSubmitting || createQuizMutation.isPending ? 'opacity-70 cursor-not-allowed' : ''}`}>
                    {isSubmitting || createQuizMutation.isPending ? (
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
        </form>
      </div>
    </div>
  );
}
