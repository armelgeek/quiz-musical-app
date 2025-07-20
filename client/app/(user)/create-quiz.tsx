"use client";

import { useForm, useFieldArray, Controller } from "react-hook-form";
import { useState } from "react";
import { Plus, Save, Globe, Lock } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { quizService, Quiz } from "@/features/quiz/quiz.service";
import { useToastContext } from "@/providers/toast-provider";

interface QuizFormValues {
  title: string;
  instruction: string;
  subject: string;
  topic: string;
  passingScore: number;
  duration: string;
  isPublic: boolean;
  questions: {
    question: string;
    options: string[];
    answer: string;
    points: number;
  }[];
}

export default function CreateQuizPage() {
  const toast = useToastContext();
  const queryClient = useQueryClient();
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

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: 'questions',
  });

  const createQuizMutation = useMutation({
    mutationFn: async (data: QuizFormValues) => {
      // Calculer maxScore et xpReward côté client
      const maxScore = data.questions.reduce((acc, q) => acc + (q.points || 1), 0);
      const xpReward = Math.floor(maxScore * 0.5);
      return quizService.create({
        ...data,
        maxScore,
        xpReward,
      });
    },
    onSuccess: () => {
      toast.success('Quiz créé avec succès !');
      queryClient.invalidateQueries({ queryKey: ['my-quizzes'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Erreur lors de la création du quiz');
    },
  });

  const onSubmit = (data: QuizFormValues) => {
    if (data.questions.length === 0) {
      toast.error('Ajoutez au moins une question');
      return;
    }
    createQuizMutation.mutate(data);
  };

  return (
    <div className="mx-auto px-4 md:px-6 py-8 md:py-12 max-w-6xl container">
      <div className="bg-white shadow-md border border-pink-100 rounded-xl overflow-hidden">
        <div className="p-6 border-pink-100 border-b">
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
        <div className="flex border-pink-100 border-b">
          <button
            className={`flex-1 px-4 py-3 text-center font-medium ${activeTab === "basic" ? "border-b-2 border-pink-500 text-pink-500" : "text-gray-500 hover:text-pink-500"} transition-colors`}
            onClick={() => setActiveTab('basic')}
            type="button"
          >
            Infos de base
          </button>
          <button
            className={`flex-1 px-4 py-3 text-center font-medium ${activeTab === "questions" ? "border-b-2 border-pink-500 text-pink-500" : "text-gray-500 hover:text-pink-500"} transition-colors`}
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
                    <input type="text" className="p-2 border border-gray-300 focus:border-pink-500 rounded-lg w-full" {...register('title', { required: true })} />
                    {errors.title && <span className="text-red-500 text-xs">Titre requis</span>}
                  </div>
                  <div className="space-y-2">
                    <label className="block font-medium text-gray-700 text-sm">Score de réussite (%)</label>
                    <input type="number" className="p-2 border border-gray-300 focus:border-pink-500 rounded-lg w-full" {...register('passingScore', { required: true, min: 0, max: 100 })} />
                    {errors.passingScore && <span className="text-red-500 text-xs">Score entre 0 et 100</span>}
                  </div>
                </div>
                <div className="gap-4 grid md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="block font-medium text-gray-700 text-sm">Sujet</label>
                    <input type="text" className="p-2 border border-gray-300 focus:border-pink-500 rounded-lg w-full" {...register('subject', { required: true })} />
                    {errors.subject && <span className="text-red-500 text-xs">Sujet requis</span>}
                  </div>
                  <div className="space-y-2">
                    <label className="block font-medium text-gray-700 text-sm">Thème</label>
                    <input type="text" className="p-2 border border-gray-300 focus:border-pink-500 rounded-lg w-full" {...register('topic', { required: true })} />
                    {errors.topic && <span className="text-red-500 text-xs">Thème requis</span>}
                  </div>
                </div>
                <div className="gap-4 grid md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="block font-medium text-gray-700 text-sm">Durée</label>
                    <select className="p-2 border border-gray-300 focus:border-pink-500 rounded-lg w-full" {...register('duration', { required: true })}>
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
                  <textarea className="p-2 border border-gray-300 focus:border-pink-500 rounded-lg w-full" rows={4} {...register('instruction', { required: true })} />
                  {errors.instruction && <span className="text-red-500 text-xs">Instructions requises</span>}
                </div>
                <div className="flex justify-end">
                  <button type="button" onClick={() => setActiveTab('questions')} className="inline-flex justify-center items-center bg-pink-500 hover:bg-pink-600 px-6 py-2 rounded-full font-medium text-white transition-colors">Suivant : Questions</button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-lg">Questions</h3>
                  <button type="button" onClick={() => append({ question: '', options: ['', ''], answer: '', points: 1 })} className="inline-flex justify-center items-center bg-pink-500 hover:bg-pink-600 px-4 py-2 rounded-full font-medium text-white transition-colors"><Plus className="mr-1 w-4 h-4" /> Ajouter une question</button>
                </div>
                {fields.length === 0 && (
                  <div className="py-8 text-center">
                    <p className="text-gray-500">Aucune question ajoutée. Cliquez sur "Ajouter une question".</p>
                  </div>
                )}
                {fields.map((field, idx) => (
                  <div key={field.id} className="border border-pink-100 rounded-lg p-4 mb-4 bg-pink-50">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1 space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Question</label>
                        <input type="text" className="p-2 border border-gray-300 rounded w-full" {...register(`questions.${idx}.question`, { required: true })} />
                        {errors.questions?.[idx]?.question && <span className="text-red-500 text-xs">Texte requis</span>}
                      </div>
                      <div className="flex-1 space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Points</label>
                        <input type="number" className="p-2 border border-gray-300 rounded w-full" {...register(`questions.${idx}.points`, { required: true, min: 1 })} />
                        {errors.questions?.[idx]?.points && <span className="text-red-500 text-xs">Points requis</span>}
                      </div>
                    </div>
                    <div className="mt-2">
                      <label className="block text-sm font-medium text-gray-700">Options</label>
                      <Controller
                        control={control}
                        name={`questions.${idx}.options`}
                        render={({ field: optionsField }) => (
                          <div className="space-y-2">
                            {optionsField.value.map((opt, optIdx) => (
                              <div key={optIdx} className="flex items-center gap-2">
                                <input type="text" className="p-2 border border-gray-300 rounded w-full" value={opt} onChange={e => {
                                  const newOptions = [...optionsField.value];
                                  newOptions[optIdx] = e.target.value;
                                  optionsField.onChange(newOptions);
                                }} />
                                <button type="button" onClick={() => {
                                  const newOptions = optionsField.value.filter((_, i) => i !== optIdx);
                                  optionsField.onChange(newOptions);
                                }} className="text-red-500 text-xs">Supprimer</button>
                              </div>
                            ))}
                            <button type="button" onClick={() => optionsField.onChange([...optionsField.value, ''])} className="text-pink-500 text-xs">Ajouter une option</button>
                          </div>
                        )}
                      />
                      {errors.questions?.[idx]?.options && <span className="text-red-500 text-xs">Au moins 2 options</span>}
                    </div>
                    <div className="mt-2">
                      <label className="block text-sm font-medium text-gray-700">Bonne réponse</label>
                      <input type="text" className="p-2 border border-gray-300 rounded w-full" {...register(`questions.${idx}.answer`, { required: true })} />
                      {errors.questions?.[idx]?.answer && <span className="text-red-500 text-xs">Réponse requise</span>}
                    </div>
                    <div className="flex justify-end mt-2">
                      <button type="button" onClick={() => remove(idx)} className="text-red-500 text-xs">Supprimer la question</button>
                    </div>
                  </div>
                ))}
                <div className="flex justify-end">
                  <button type="submit" disabled={isSubmitting || createQuizMutation.isPending} className={`inline-flex justify-center items-center bg-pink-500 hover:bg-pink-600 px-6 py-2 rounded-full font-medium text-white transition-colors ${isSubmitting || createQuizMutation.isPending ? 'opacity-70 cursor-not-allowed' : ''}`}>
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
